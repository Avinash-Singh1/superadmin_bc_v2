// src/app/payouts/payouts-list/payouts-list.component.ts
//
// Phase 4 — Doctor payouts dashboard. Two tabs: "Eligible" (KYC-verified
// doctors with pending balance ≥ minPayout) and "History" (all payouts).
// Right-side detail aside with mark-processed / mark-failed / cancel actions.

import { Component, OnInit } from "@angular/core";
import { ApiService } from "../../shared/api.service";
import { URLConstant } from "../../apisURL/url";
import { MatSnackBar } from "@angular/material/snack-bar";

interface EligibleDoctor {
  doctorUserId: string;
  doctorName: string | null;
  doctorPhone: string | null;
  doctorEmail: string | null;
  pendingBalance: number;
  paidOutBalance: number;
  awaitingKycBalance: number;
  kycStatus: string;
  panLast4: string | null;
  beneficiaryName: string | null;
  bankLast4: string | null;
  ifsc: string | null;
  razorpayFundAccountId: string | null;
  eligible: boolean;
}

interface PayoutRow {
  _id: string;
  doctorUserId: string;
  doctorName?: string | null;
  doctorPhone?: string | null;
  grossAmount: number;
  tdsAmount: number;
  netAmount: number;
  mode: "IMPS" | "NEFT" | "UPI" | "manual";
  reference?: string | null;
  status: "queued" | "processing" | "processed" | "failed" | "reversed" | "cancelled";
  failureReason?: string | null;
  razorpayPayoutId?: string | null;
  razorpayUtr?: string | null;
  rzpStatus?: string | null;
  paymentIds?: string[];
  walletReverted?: boolean;
  createdAt: string;
  processedAt?: string | null;
  initiatedAt?: string | null;
  kycSnapshot?: any;
  walletSnapshotBefore?: any;
  walletSnapshotAfter?: any;
}

interface PayoutSummaryTotals {
  count: number;
  gross: number;
  tds: number;
  net: number;
}

@Component({
  selector: "app-payouts-list",
  templateUrl: "./payouts-list.component.html",
  styleUrls: ["./payouts-list.component.scss"],
})
export class PayoutsListComponent implements OnInit {
  readonly statuses = ["", "queued", "processing", "processed", "failed", "reversed", "cancelled"];
  readonly modes = ["IMPS", "NEFT", "UPI", "manual"];

  tab: "eligible" | "history" = "eligible";

  // Eligible tab
  eligibleRows: EligibleDoctor[] = [];
  eligibleLoading = false;
  minPayout = 0;
  rzpxConfigured = false;
  tdsBps = 0;

  // History tab
  status = "";
  from = "";
  to = "";
  page = 1;
  itemsPerPage = 25;
  total = 0;
  rows: PayoutRow[] = [];
  loading = false;
  buckets: any[] = [];
  totals: PayoutSummaryTotals | null = null;

  // Detail
  selected: PayoutRow | null = null;
  selectedDetail: any = null;
  loadingDetail = false;
  acting = false;

  // Initiate dialog
  initiating: EligibleDoctor | null = null;
  initiateMode: "IMPS" | "NEFT" | "UPI" | "manual" = "manual";
  initiateReference = "";
  initiateNotes = "";
  initiateUseRzpx = false;
  initiateNarration = "";

  // Mark/cancel form
  markReference = "";
  markFailureReason = "";
  cancelReason = "";

  constructor(private api: ApiService, private snack: MatSnackBar) {}

  ngOnInit(): void {
    this.fetchEligible();
    this.fetchHistory();
    this.fetchSummary();
  }

  switchTab(t: "eligible" | "history"): void {
    this.tab = t;
    if (t === "eligible") this.fetchEligible();
    else {
      this.fetchHistory();
      this.fetchSummary();
    }
  }

  // ----- Eligible -----
  fetchEligible(): void {
    this.eligibleLoading = true;
    this.api.GetData(URLConstant.payoutsEligible, {}).subscribe({
      next: (res: any) => {
        this.eligibleLoading = false;
        const d = res?.result || {};
        this.eligibleRows = d.rows || [];
        this.minPayout = d.minPayout || 0;
        this.rzpxConfigured = !!d.rzpxConfigured;
        this.tdsBps = d.tdsBps || 0;
      },
      error: () => {
        this.eligibleLoading = false;
        this.snack.open("Failed to load eligible doctors", "Close", { duration: 3000 });
      },
    });
  }

  // ----- History -----
  fetchHistory(): void {
    this.loading = true;
    const params: any = { page: this.page, limit: this.itemsPerPage };
    if (this.status) params.status = this.status;
    if (this.from) params.from = this.from;
    if (this.to) params.to = this.to;
    this.api.GetData(URLConstant.payoutsList, params).subscribe({
      next: (res: any) => {
        this.loading = false;
        const d = res?.result || {};
        this.rows = d.rows || [];
        this.total = d.total || 0;
      },
      error: () => {
        this.loading = false;
        this.snack.open("Failed to load payouts", "Close", { duration: 3000 });
      },
    });
  }

  fetchSummary(): void {
    const params: any = {};
    if (this.from) params.from = this.from;
    if (this.to) params.to = this.to;
    this.api.GetData(URLConstant.payoutsSummary, params).subscribe({
      next: (res: any) => {
        const d = res?.result || {};
        this.buckets = d.buckets || [];
        this.totals = d.totals || null;
      },
      error: () => {},
    });
  }

  applyFilters(): void {
    this.page = 1;
    this.fetchHistory();
    this.fetchSummary();
  }

  clearFilters(): void {
    this.status = "";
    this.from = "";
    this.to = "";
    this.applyFilters();
  }

  onPageChange(p: number): void {
    this.page = p;
    this.fetchHistory();
  }

  // ----- Initiate -----
  openInitiate(doc: EligibleDoctor): void {
    this.initiating = doc;
    this.initiateMode = "manual";
    this.initiateReference = "";
    this.initiateNotes = "";
    this.initiateUseRzpx = false;
    this.initiateNarration = "";
  }

  closeInitiate(): void {
    this.initiating = null;
  }

  submitInitiate(): void {
    if (!this.initiating) return;
    const body: any = {
      doctorUserId: this.initiating.doctorUserId,
      mode: this.initiateMode,
      useRzpx: this.initiateUseRzpx,
    };
    if (this.initiateReference) body.reference = this.initiateReference;
    if (this.initiateNotes) body.notes = this.initiateNotes;
    if (this.initiateNarration) body.narration = this.initiateNarration;

    this.acting = true;
    this.api.Postdata(URLConstant.payoutsInitiate, body, {}).subscribe({
      next: (res: any) => {
        this.acting = false;
        this.snack.open("Payout created", "Close", { duration: 2500 });
        this.closeInitiate();
        this.tab = "history";
        this.fetchHistory();
        this.fetchSummary();
        this.fetchEligible();
        const p = res?.result?.payout;
        if (p) this.openDetail(p as PayoutRow);
      },
      error: (err: any) => {
        this.acting = false;
        const msg = err?.error?.message || err?.message || "Payout failed";
        this.snack.open(msg, "Close", { duration: 4000 });
      },
    });
  }

  // ----- Detail -----
  openDetail(row: PayoutRow): void {
    this.selected = row;
    this.selectedDetail = null;
    this.markReference = "";
    this.markFailureReason = "";
    this.cancelReason = "";
    this.loadingDetail = true;
    this.api.GetData(URLConstant.payoutsDetail + row._id, {}).subscribe({
      next: (res: any) => {
        this.loadingDetail = false;
        this.selectedDetail = res?.result || null;
        if (this.selectedDetail?.payout) this.selected = this.selectedDetail.payout;
      },
      error: () => {
        this.loadingDetail = false;
        this.snack.open("Failed to load payout detail", "Close", { duration: 3000 });
      },
    });
  }

  closeDetail(): void {
    this.selected = null;
    this.selectedDetail = null;
  }

  canMark(): boolean {
    return !!this.selected && (this.selected.status === "queued" || this.selected.status === "processing");
  }

  canCancel(): boolean {
    return !!this.selected && this.selected.status === "queued";
  }

  markProcessed(): void {
    if (!this.selected || !this.canMark()) return;
    if (!window.confirm("Mark this payout as processed?")) return;
    this.acting = true;
    this.api
      .Postdata(URLConstant.payoutsMark + this.selected._id + "/mark", {
        status: "processed",
        reference: this.markReference || undefined,
      }, {})
      .subscribe({
        next: () => {
          this.acting = false;
          this.snack.open("Payout marked processed", "Close", { duration: 2500 });
          this.refreshAfterAction();
        },
        error: () => {
          this.acting = false;
          this.snack.open("Failed to mark processed", "Close", { duration: 3000 });
        },
      });
  }

  markFailed(): void {
    if (!this.selected || !this.canMark()) return;
    if (!window.confirm("Mark payout failed? Wallet will be credited back.")) return;
    this.acting = true;
    this.api
      .Postdata(URLConstant.payoutsMark + this.selected._id + "/mark", {
        status: "failed",
        failureReason: this.markFailureReason || undefined,
      }, {})
      .subscribe({
        next: () => {
          this.acting = false;
          this.snack.open("Payout marked failed; wallet credited back", "Close", { duration: 3000 });
          this.refreshAfterAction();
        },
        error: () => {
          this.acting = false;
          this.snack.open("Failed to update", "Close", { duration: 3000 });
        },
      });
  }

  cancelPayout(): void {
    if (!this.selected || !this.canCancel()) return;
    if (!window.confirm("Cancel this queued payout? Wallet will be credited back.")) return;
    this.acting = true;
    this.api
      .Postdata(URLConstant.payoutsCancel + this.selected._id + "/cancel", {
        reason: this.cancelReason || undefined,
      }, {})
      .subscribe({
        next: () => {
          this.acting = false;
          this.snack.open("Payout cancelled", "Close", { duration: 2500 });
          this.refreshAfterAction();
        },
        error: () => {
          this.acting = false;
          this.snack.open("Failed to cancel", "Close", { duration: 3000 });
        },
      });
  }

  private refreshAfterAction(): void {
    const id = this.selected?._id;
    this.fetchHistory();
    this.fetchSummary();
    this.fetchEligible();
    if (id) this.openDetail({ _id: id } as PayoutRow);
  }

  // ----- Helpers -----
  formatPaise(p: number | null | undefined): string {
    if (p == null) return "—";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(p / 100);
  }

  statusBadge(s: string | null | undefined): string {
    switch (s) {
      case "processed":
        return "badge ok";
      case "queued":
      case "processing":
        return "badge info";
      case "failed":
      case "reversed":
        return "badge err";
      case "cancelled":
        return "badge warn";
      default:
        return "badge";
    }
  }

  statusClass(s: string | null | undefined): string {
    switch (s) {
      case "processed":                return "status-badge--ok";
      case "queued":
      case "processing":               return "status-badge--info";
      case "failed":
      case "reversed":                 return "status-badge--err";
      case "cancelled":                return "status-badge--warn";
      default:                         return "status-badge--default";
    }
  }

  statusLabel(s: string | null | undefined): string {
    return (s || "—").toUpperCase();
  }
}

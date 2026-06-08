// src/app/kyc/kyc-list/kyc-list.component.ts
//
// Admin Doctor-KYC review screen. List on the left, inline detail panel on the
// right. Status filter is server-side; pagination uses ngx-pagination's client
// page logic against the page returned by the API (same pattern as RequestsComponent).
//
// IMPORTANT: This page never displays full PAN / account numbers. The backend
// strips encrypted payloads before returning, and we only show *.last4.

import { Component, OnInit } from "@angular/core";
import { ApiService } from "../../shared/api.service";
import { URLConstant } from "../../apisURL/url";
import { MatSnackBar } from "@angular/material/snack-bar";

interface KycRow {
  _id: string;
  userId: string;
  kycStatus: "not_submitted" | "submitted" | "manual_review" | "verified" | "rejected";
  pan?: { last4?: string; nameOnPan?: string; verified?: boolean; razorpayPanRefId?: string };
  bank?: {
    last4?: string;
    ifsc?: string;
    beneficiaryName?: string;
    accountType?: string;
    verified?: boolean;
  };
  gst?: { gstin?: string; legalName?: string; required?: boolean; verified?: boolean };
  aadhaar?: { last4?: string; verified?: boolean };
  cancelledChequeUrl?: string | null;
  rejectionReason?: string | null;
  reviewLog?: Array<{ action: string; reason?: string; at: string }>;
  submittedAt?: string | null;
  verifiedAt?: string | null;
  platformCommissionBps?: number | null;
  updatedAt?: string;
}

interface WalletRow {
  pendingBalance: number;
  awaitingKycBalance: number;
  paidOutBalance: number;
  tdsDeductedTotal: number;
  commissionDeductedTotal: number;
  lifetimeGross: number;
}

interface UserRow {
  _id: string;
  fullName?: string;
  email?: string;
  phone?: string;
}

@Component({
  selector: "app-kyc-list",
  templateUrl: "./kyc-list.component.html",
  styleUrls: ["./kyc-list.component.scss"],
})
export class KycListComponent implements OnInit {
  readonly statuses: Array<KycRow["kycStatus"] | ""> = [
    "",
    "submitted",
    "manual_review",
    "verified",
    "rejected",
    "not_submitted",
  ];

  loading = false;
  loadingDetail = false;
  status: string = "manual_review";
  page = 1;
  itemsPerPage = 20;
  total = 0;
  rows: KycRow[] = [];

  selected: KycRow | null = null;
  selectedWallet: WalletRow | null = null;
  selectedUser: UserRow | null = null;

  reasonText = "";
  commissionPct: number | null = null; // % shown in UI; converted to bps on submit

  constructor(private api: ApiService, private snack: MatSnackBar) {}

  ngOnInit(): void {
    this.fetch();
  }

  fetch(): void {
    this.loading = true;
    const params: any = { page: this.page, limit: this.itemsPerPage };
    if (this.status) params.status = this.status;

    this.api.GetData(URLConstant.kycList, params).subscribe({
      next: (res: any) => {
        this.loading = false;
        const result = res?.result || {};
        this.rows = result.items || [];
        this.total = result.total || 0;
      },
      error: () => {
        this.loading = false;
        this.snack.open("Failed to load KYC list", "Close", { duration: 3000 });
      },
    });
  }

  onStatusChange(): void {
    this.page = 1;
    this.fetch();
  }

  onPageChange(p: number): void {
    this.page = p;
    this.fetch();
  }

  openDetail(row: KycRow): void {
    this.selected = row;
    this.selectedWallet = null;
    this.selectedUser = null;
    this.reasonText = "";
    this.commissionPct = row.platformCommissionBps != null ? row.platformCommissionBps / 100 : null;
    this.loadingDetail = true;

    this.api.GetData(URLConstant.kycDetail + row.userId, {}).subscribe({
      next: (res: any) => {
        this.loadingDetail = false;
        const r = res?.result || {};
        this.selected = r.kyc || row;
        this.selectedWallet = r.wallet || null;
        this.selectedUser = r.user || null;
        this.commissionPct =
          this.selected?.platformCommissionBps != null
            ? this.selected.platformCommissionBps / 100
            : null;
      },
      error: () => {
        this.loadingDetail = false;
        this.snack.open("Failed to load KYC detail", "Close", { duration: 3000 });
      },
    });
  }

  closeDetail(): void {
    this.selected = null;
    this.selectedWallet = null;
    this.selectedUser = null;
  }

  approve(): void {
    if (!this.selected) return;
    const body: any = { note: this.reasonText || undefined };
    if (typeof this.commissionPct === "number" && this.commissionPct >= 0 && this.commissionPct <= 100) {
      body.commissionBps = Math.round(this.commissionPct * 100);
    }
    this.api
      .Postdata(URLConstant.kycApprove + this.selected.userId + "/approve", body, {})
      .subscribe({
        next: () => {
          this.snack.open("KYC approved", "Close", { duration: 2500 });
          this.closeDetail();
          this.fetch();
        },
        error: () => this.snack.open("Approve failed", "Close", { duration: 3000 }),
      });
  }

  reject(): void {
    if (!this.selected) return;
    const reason = (this.reasonText || "").trim();
    if (reason.length < 3) {
      this.snack.open("Rejection reason is required (min 3 chars)", "Close", { duration: 3000 });
      return;
    }
    this.api
      .Postdata(URLConstant.kycReject + this.selected.userId + "/reject", { reason }, {})
      .subscribe({
        next: () => {
          this.snack.open("KYC rejected", "Close", { duration: 2500 });
          this.closeDetail();
          this.fetch();
        },
        error: () => this.snack.open("Reject failed", "Close", { duration: 3000 }),
      });
  }

  formatPaise(p: number | null | undefined): string {
    if (!p || p <= 0) return "₹0";
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(p / 100);
  }

  statusBadge(s: string): string {
    switch (s) {
      case "verified": return "badge ok";
      case "rejected": return "badge err";
      case "submitted":
      case "manual_review": return "badge warn";
      default: return "badge";
    }
  }

  statusClass(s: string): string {
    switch (s) {
      case "verified":      return "status-badge--ok";
      case "rejected":      return "status-badge--err";
      case "submitted":
      case "manual_review": return "status-badge--warn";
      default:              return "status-badge--default";
    }
  }

  statusLabel(s: string): string {
    switch (s) {
      case "verified": return "Verified";
      case "rejected": return "Rejected";
      case "submitted": return "Submitted";
      case "manual_review": return "Manual review";
      case "not_submitted": return "Not submitted";
      default: return s;
    }
  }
}

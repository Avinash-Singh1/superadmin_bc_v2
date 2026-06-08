// src/app/payments/payments-list/payments-list.component.ts
//
// Admin payments dashboard. Filters (status, date range, search by RZP id),
// summary KPIs (gross paid, commission, refunded, cancellation fee), and a
// detail aside with a manual-refund control.

import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ApiService } from "../../shared/api.service";
import { URLConstant } from "../../apisURL/url";
import { MatSnackBar } from "@angular/material/snack-bar";
import { environment } from "../../../environments/environment";

interface PaymentRow {
  _id: string;
  amount: number;
  currency: string;
  commissionAmount: number;
  doctorPayoutAmount: number;
  platformCommissionBps: number | null;
  status: "created" | "paid" | "failed" | "refund_pending" | "refunded" | "refund_failed";
  failureReason?: string | null;
  razorpayOrderId: string;
  razorpayPaymentId?: string | null;
  doctorId: string;
  patientUserId: string;
  appointmentId?: string | null;
  doctorName?: string | null;
  patientName?: string | null;
  patientPhone?: string | null;
  bookingDraft?: { date?: string; consultationType?: string };
  refund?: {
    amount?: number;
    cancellationFee?: number;
    reason?: string | null;
    cancelledBy?: string | null;
    razorpayRefundId?: string | null;
    initiatedAt?: string | null;
    processedAt?: string | null;
    rzpStatus?: string | null;
    policy?: string | null;
  };
  walletReversed?: boolean;
  paidAt?: string | null;
  createdAt: string;
}

interface SummaryBucket {
  count: number;
  gross: number;
  commission: number;
  payout: number;
  refunded: number;
  cancellationFee: number;
}

interface SummaryTotals {
  count: number;
  grossPaid: number;
  commission: number;
  refunded: number;
  cancellationFee: number;
  netRevenue: number;
}

@Component({
  selector: "app-payments-list",
  templateUrl: "./payments-list.component.html",
  styleUrls: ["./payments-list.component.scss"],
})
export class PaymentsListComponent implements OnInit {
  readonly statuses = ["", "paid", "refund_pending", "refunded", "refund_failed", "failed", "created"];

  loading = false;
  loadingDetail = false;
  refunding = false;

  status = "";
  from = "";
  to = "";
  search = "";

  page = 1;
  itemsPerPage = 25;
  total = 0;
  rows: PaymentRow[] = [];

  buckets: Record<string, SummaryBucket> = {};
  totals: SummaryTotals | null = null;

  selected: PaymentRow | null = null;
  selectedDetail: any = null;

  refundAmountRupees: number | null = null; // empty = policy-driven
  refundReason = "";
  refundForceFull = false;

  constructor(private api: ApiService, private snack: MatSnackBar, private http: HttpClient) {}

  ngOnInit(): void {
    this.fetch();
    this.fetchSummary();
  }

  private buildParams(): any {
    const params: any = { page: this.page, limit: this.itemsPerPage };
    if (this.status) params.status = this.status;
    if (this.from) params.from = this.from;
    if (this.to) params.to = this.to;
    if (this.search?.trim()) params.search = this.search.trim();
    return params;
  }

  fetch(): void {
    this.loading = true;
    this.api.GetData(URLConstant.paymentsList, this.buildParams()).subscribe({
      next: (res: any) => {
        this.loading = false;
        const result = res?.result || {};
        this.rows = result.items || [];
        this.total = result.total || 0;
      },
      error: () => {
        this.loading = false;
        this.snack.open("Failed to load payments", "Close", { duration: 3000 });
      },
    });
  }

  fetchSummary(): void {
    const params: any = {};
    if (this.from) params.from = this.from;
    if (this.to) params.to = this.to;
    this.api.GetData(URLConstant.paymentsSummary, params).subscribe({
      next: (res: any) => {
        const result = res?.result || {};
        this.buckets = result.buckets || {};
        this.totals = result.totals || null;
      },
      error: () => {
        // Silent — summary is auxiliary
      },
    });
  }

  applyFilters(): void {
    this.page = 1;
    this.fetch();
    this.fetchSummary();
  }

  clearFilters(): void {
    this.status = "";
    this.from = "";
    this.to = "";
    this.search = "";
    this.applyFilters();
  }

  onPageChange(p: number): void {
    this.page = p;
    this.fetch();
  }

  openDetail(row: PaymentRow): void {
    this.selected = row;
    this.selectedDetail = null;
    this.refundAmountRupees = null;
    this.refundReason = "";
    this.refundForceFull = false;
    this.loadingDetail = true;

    this.api.GetData(URLConstant.paymentsDetail + row._id, {}).subscribe({
      next: (res: any) => {
        this.loadingDetail = false;
        this.selectedDetail = res?.result || null;
        if (this.selectedDetail?.payment) {
          this.selected = this.selectedDetail.payment;
        }
      },
      error: () => {
        this.loadingDetail = false;
        this.snack.open("Failed to load payment detail", "Close", { duration: 3000 });
      },
    });
  }

  closeDetail(): void {
    this.selected = null;
    this.selectedDetail = null;
  }

  canRefund(): boolean {
    return !!this.selected && (this.selected.status === "paid" || this.selected.status === "refund_failed");
  }

  triggerRefund(): void {
    if (!this.selected || !this.canRefund()) return;
    const body: any = { reason: this.refundReason || undefined };
    if (this.refundForceFull) {
      body.forceFullRefund = true;
    } else if (typeof this.refundAmountRupees === "number" && this.refundAmountRupees >= 0) {
      body.amount = Math.round(this.refundAmountRupees * 100);
    }

    const confirmMsg = this.refundForceFull
      ? "Issue a FULL refund for this payment?"
      : body.amount != null
      ? `Issue a refund of ₹${this.refundAmountRupees}?`
      : "Issue a policy-driven refund?";
    if (!confirm(confirmMsg)) return;

    this.refunding = true;
    this.api
      .Postdata(URLConstant.paymentsRefund + this.selected._id + "/refund", body, {})
      .subscribe({
        next: (res: any) => {
          this.refunding = false;
          const r = res?.result || {};
          if (r.skipped) {
            this.snack.open(`Refund skipped: ${r.skipped}`, "Close", { duration: 3500 });
          } else if (r.alreadyRefunded) {
            this.snack.open("Already refunded", "Close", { duration: 2500 });
          } else {
            this.snack.open(
              `Refund initiated · ₹${(r.refundAmount / 100).toFixed(2)} (fee ₹${(r.cancellationFee / 100).toFixed(2)})`,
              "Close",
              { duration: 3500 }
            );
          }
          // Re-fetch detail + list
          if (this.selected) this.openDetail(this.selected);
          this.fetch();
          this.fetchSummary();
        },
        error: (err) => {
          this.refunding = false;
          this.snack.open(err?.error?.message || "Refund failed", "Close", { duration: 3500 });
        },
      });
  }

  formatPaise(p: number | null | undefined): string {
    if (p == null) return "—";
    if (p === 0) return "₹0";
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(p / 100);
  }

  formatBps(bps: number | null | undefined): string {
    if (bps == null) return "—";
    return (bps / 100).toFixed(2) + "%";
  }

  statusBadge(s: string): string {
    switch (s) {
      case "paid": return "badge ok";
      case "refund_pending": return "badge warn";
      case "refunded": return "badge info";
      case "refund_failed":
      case "failed": return "badge err";
      case "created": return "badge warn";
      default: return "badge";
    }
  }

  statusClass(s: string): string {
    switch (s) {
      case "paid":           return "status-badge--ok";
      case "refund_pending":  return "status-badge--warn";
      case "refunded":        return "status-badge--info";
      case "refund_failed":
      case "failed":          return "status-badge--err";
      case "created":         return "status-badge--warn";
      default:                return "status-badge--default";
    }
  }

  statusLabel(s: string): string {
    switch (s) {
      case "paid": return "Paid";
      case "refund_pending": return "Refund pending";
      case "refunded": return "Refunded";
      case "refund_failed": return "Refund failed";
      case "failed": return "Failed";
      case "created": return "Pending";
      default: return s;
    }
  }

  downloadReceipt(row: PaymentRow, event?: Event): void {
    if (event) { event.stopPropagation(); }
    if (!row?._id) return;
    if (!["paid", "refund_pending", "refunded", "refund_failed"].includes(row.status)) {
      this.snack.open("Receipt not available for this payment", "Close", { duration: 2500 });
      return;
    }
    const url = environment.API_BASE_URL + URLConstant.paymentsReceipt + row._id + "/receipt";
    this.http.get(url, { responseType: "blob" }).subscribe({
      next: (blob: Blob) => {
        const objectUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = objectUrl;
        a.download = `receipt-${row._id.slice(-10)}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(objectUrl);
      },
      error: () => {
        this.snack.open("Failed to download receipt", "Close", { duration: 3000 });
      },
    });
  }
}

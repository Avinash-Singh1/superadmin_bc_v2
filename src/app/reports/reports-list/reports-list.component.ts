import { Component, OnInit } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ApiService } from "../../shared/api.service";
import { URLConstant } from "../../apisURL/url";
import { environment } from "../../../environments/environment";

interface DayBucket {
  day: string;
  payments: { count: number; gross: number; commission: number; gst: number; doctorShare: number };
  refunds: { count: number; refunded: number; fee: number };
  payouts: { count: number; gross: number; tds: number; net: number; byStatus: Record<string, number> };
}

interface SummaryResponse {
  from: string;
  to: string;
  gstBps: number;
  days: DayBucket[];
  totals: {
    payments: { count: number; gross: number; commission: number; gst: number; doctorShare: number };
    refunds: { count: number; refunded: number; fee: number };
    payouts: { count: number; gross: number; tds: number; net: number };
  };
}

@Component({
  selector: "app-reports-list",
  templateUrl: "./reports-list.component.html",
  styleUrls: ["./reports-list.component.scss"],
})
export class ReportsListComponent implements OnInit {
  // Range — default last 30 days inclusive of today
  from = "";
  to = "";

  loading = false;
  downloading: string | null = null;
  data: SummaryResponse | null = null;

  constructor(
    private apiService: ApiService,
    private http: HttpClient,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    const today = new Date();
    const start = new Date();
    start.setDate(today.getDate() - 29);
    this.from = this.fmtDate(start);
    this.to = this.fmtDate(today);
    this.fetch();
  }

  fmtDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
  }

  fetch(): void {
    if (!this.from || !this.to) {
      this.snack.open("Pick both dates", "OK", { duration: 2500 });
      return;
    }
    this.loading = true;
    this.apiService
      .GetData(URLConstant.reportsSummary, { from: this.from, to: this.to })
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          this.data = res?.data || null;
        },
        error: (err: any) => {
          this.loading = false;
          this.snack.open(
            err?.error?.error || err?.message || "Failed to load summary",
            "OK",
            { duration: 3500 }
          );
        },
      });
  }

  download(kind: "payments" | "refunds" | "payouts" | "commission"): void {
    if (!this.from || !this.to) {
      this.snack.open("Pick both dates", "OK", { duration: 2500 });
      return;
    }
    let endpoint = "";
    switch (kind) {
      case "payments":   endpoint = URLConstant.reportsPaymentsCsv;   break;
      case "refunds":    endpoint = URLConstant.reportsRefundsCsv;    break;
      case "payouts":    endpoint = URLConstant.reportsPayoutsCsv;    break;
      case "commission": endpoint = URLConstant.reportsCommissionCsv; break;
    }
    const url = `${environment.API_BASE_URL}${endpoint}?from=${encodeURIComponent(
      this.from
    )}&to=${encodeURIComponent(this.to)}`;

    this.downloading = kind;
    this.http
      .get(url, { responseType: "blob", observe: "response" })
      .subscribe({
        next: (resp) => {
          this.downloading = null;
          const blob = resp.body as Blob;
          if (!blob) {
            this.snack.open("Empty download", "OK", { duration: 2500 });
            return;
          }
          const dl = document.createElement("a");
          const objectUrl = window.URL.createObjectURL(blob);
          dl.href = objectUrl;
          dl.download = `${kind}_${this.from}_${this.to}.csv`;
          document.body.appendChild(dl);
          dl.click();
          document.body.removeChild(dl);
          window.URL.revokeObjectURL(objectUrl);
        },
        error: (err: any) => {
          this.downloading = null;
          this.snack.open(
            err?.error?.error || err?.message || "Download failed",
            "OK",
            { duration: 3500 }
          );
        },
      });
  }

  rupees(paise: number | undefined | null): string {
    const p = Math.round(Number(paise || 0));
    return "₹" + (p / 100).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  setRange(kind: "today" | "7d" | "30d" | "thisMonth" | "lastMonth"): void {
    const now = new Date();
    const start = new Date();
    switch (kind) {
      case "today":
        this.from = this.fmtDate(now);
        this.to = this.fmtDate(now);
        break;
      case "7d":
        start.setDate(now.getDate() - 6);
        this.from = this.fmtDate(start);
        this.to = this.fmtDate(now);
        break;
      case "30d":
        start.setDate(now.getDate() - 29);
        this.from = this.fmtDate(start);
        this.to = this.fmtDate(now);
        break;
      case "thisMonth": {
        const f = new Date(now.getFullYear(), now.getMonth(), 1);
        this.from = this.fmtDate(f);
        this.to = this.fmtDate(now);
        break;
      }
      case "lastMonth": {
        const f = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const t = new Date(now.getFullYear(), now.getMonth(), 0);
        this.from = this.fmtDate(f);
        this.to = this.fmtDate(t);
        break;
      }
    }
    this.fetch();
  }
}

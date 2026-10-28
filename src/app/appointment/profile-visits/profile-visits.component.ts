import { Component, OnInit } from "@angular/core";
import { URLConstant } from "src/app/apisURL/url";
import { ApiService } from "src/app/shared/api.service";
import { ToastrService } from "ngx-toastr";
import { forkJoin } from "rxjs";
import * as XLSX from "xlsx";

@Component({
  selector: "app-profile-visits",
  templateUrl: "./profile-visits.component.html",
  styleUrls: ["./profile-visits.component.scss"],
})
export class ProfileVisitsComponent implements OnInit {
  visits: any[] = [];
  loading = false;
  refreshing = false;
  exporting = false;
  search = "";
  total = 0;
  page = 1;
  pageSize = 10;
  pageSizeOptions = [10, 25, 50, 100];

  selectedRange: "today" | "yesterday" | "week" | "month" | "quarter" | "custom" = "today";
  customStartDate: string = "";
  customEndDate: string = "";

  sortBy: string = "createdAt";
  sortOrder: "DESC" | "ASC" = "DESC";

  stats = {
    today: 0,
    yesterday: 0,
    week: 0,
    month: 0,
    total: 0,
  };

  selectedVisit: any = null;
  copiedKey: string = "";

  constructor(
    private api: ApiService,
    private toastr?: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadVisits();
  }

  rangeDates(range: "today" | "yesterday" | "week" | "month" | "quarter" | "custom"): { fromDate: string; toDate: string } {
    const now = new Date();
    const start = new Date(now);

    if (range === "today") {
      start.setHours(0, 0, 0, 0);
      return { fromDate: start.toISOString(), toDate: now.toISOString() };
    }

    if (range === "yesterday") {
      const yesterdayStart = new Date(now);
      yesterdayStart.setDate(yesterdayStart.getDate() - 1);
      yesterdayStart.setHours(0, 0, 0, 0);
      const yesterdayEnd = new Date(now);
      yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
      yesterdayEnd.setHours(23, 59, 59, 999);
      return { fromDate: yesterdayStart.toISOString(), toDate: yesterdayEnd.toISOString() };
    }

    if (range === "week") {
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      return { fromDate: start.toISOString(), toDate: now.toISOString() };
    }

    if (range === "month") {
      start.setDate(start.getDate() - 29);
      start.setHours(0, 0, 0, 0);
      return { fromDate: start.toISOString(), toDate: now.toISOString() };
    }

    if (range === "quarter") {
      start.setDate(start.getDate() - 89);
      start.setHours(0, 0, 0, 0);
      return { fromDate: start.toISOString(), toDate: now.toISOString() };
    }

    if (range === "custom" && this.customStartDate && this.customEndDate) {
      const s = new Date(this.customStartDate);
      s.setHours(0, 0, 0, 0);
      const e = new Date(this.customEndDate);
      e.setHours(23, 59, 59, 999);
      return { fromDate: s.toISOString(), toDate: e.toISOString() };
    }

    start.setHours(0, 0, 0, 0);
    return { fromDate: start.toISOString(), toDate: now.toISOString() };
  }

  requestParams(
    range: "today" | "yesterday" | "week" | "month" | "quarter" | "custom",
    includePaging = true
  ): any {
    const dates = this.rangeDates(range);
    const params: any = {
      status: 3,
      fromDate: dates.fromDate,
      toDate: dates.toDate,
    };

    if (includePaging) {
      params.page = this.page;
      params.size = this.pageSize;
      params.sort = this.sortBy;
      params.sortOrder = this.sortOrder;
      if (this.search && this.search.trim()) {
        params.search = this.search.trim();
      }
    }
    return params;
  }

  loadStats(): void {
    forkJoin({
      today: this.api.Postdata(URLConstant.appointmentList, "", this.requestParams("today", false)),
      yesterday: this.api.Postdata(URLConstant.appointmentList, "", this.requestParams("yesterday", false)),
      week: this.api.Postdata(URLConstant.appointmentList, "", this.requestParams("week", false)),
      month: this.api.Postdata(URLConstant.appointmentList, "", this.requestParams("month", false)),
    }).subscribe({
      next: (res: any) => {
        this.stats = {
          today: res.today?.result?.count || 0,
          yesterday: res.yesterday?.result?.count || 0,
          week: res.week?.result?.count || 0,
          month: res.month?.result?.count || 0,
          total: res.month?.result?.count || 0,
        };
      },
      error: () => {
        this.stats = { today: 0, yesterday: 0, week: 0, month: 0, total: 0 };
      },
    });
  }

  loadVisits(): void {
    this.loading = true;
    const params = this.requestParams(this.selectedRange, true);
    this.api.Postdata(URLConstant.appointmentList, "", params).subscribe({
      next: (res: any) => {
        this.visits = res?.result?.data || [];
        this.total = res?.result?.count || 0;
        this.loading = false;
        this.refreshing = false;
      },
      error: () => {
        this.visits = [];
        this.total = 0;
        this.loading = false;
        this.refreshing = false;
      },
    });
  }

  onRangeSelect(range: "today" | "yesterday" | "week" | "month" | "quarter" | "custom"): void {
    this.selectedRange = range;
    this.page = 1;
    if (range !== "custom") {
      this.loadVisits();
    }
  }

  onCustomDateChange(): void {
    if (this.customStartDate && this.customEndDate) {
      this.selectedRange = "custom";
      this.page = 1;
      this.loadVisits();
    }
  }

  onSearch(): void {
    this.page = 1;
    this.loadVisits();
  }

  clearSearch(): void {
    this.search = "";
    this.page = 1;
    this.loadVisits();
  }

  getPatientPhone(visit: any): string {
    const phoneCandidates = [
      visit?.patientPhone,
      visit?.phone,
      visit?.patient?.phone,
      visit?.patientUser?.phone,
      visit?.mobile,
      visit?.mobileNumber,
    ];

    const phone = phoneCandidates.find((value) => {
      const normalized = String(value ?? "").trim();
      return normalized && normalized.toLowerCase() !== "n/a";
    });

    return phone ? String(phone).trim() : "";
  }

  onSort(column: string): void {
    if (this.sortBy === column) {
      this.sortOrder = this.sortOrder === "DESC" ? "ASC" : "DESC";
    } else {
      this.sortBy = column;
      this.sortOrder = "DESC";
    }
    this.page = 1;
    this.loadVisits();
  }

  onPageChange(newPage: number): void {
    this.page = newPage;
    this.loadVisits();
  }

  onPageSizeChange(newSize: any): void {
    this.pageSize = Number(newSize);
    this.page = 1;
    this.loadVisits();
  }

  refresh(): void {
    this.refreshing = true;
    this.loadStats();
    this.loadVisits();
    if (this.toastr) {
      this.toastr.info("Profile visits refreshed", "Updated");
    }
  }

  exportToExcel(): void {
    if (!this.visits || this.visits.length === 0) {
      if (this.toastr) {
        this.toastr.warning("No records to export", "Export");
      }
      return;
    }

    this.exporting = true;
    const exportParams = this.requestParams(this.selectedRange, false);
    exportParams.page = 1;
    exportParams.size = 1000;

    this.api.Postdata(URLConstant.appointmentList, "", exportParams).subscribe({
      next: (res: any) => {
        const dataset = res?.result?.data || this.visits;
        const headers = [
          "Patient Name",
          "Patient Phone",
          "Doctor Name",
          "Establishment / Clinic",
          "Source",
          "Visit Count",
          "Last Visited At",
          "Created At",
          "Status"
        ];

        const rows = dataset.map((v: any) => [
          v.patientName || v.name || "Anonymous Patient",
          this.getPatientPhone(v) || "N/A",
          v.doctorName ? `Dr. ${v.doctorName.replace(/^Dr\.?\s*/i, "")}` : "N/A",
          v.establishmentName || "N/A",
          v.source || "Web / Search",
          v.visitCount || 1,
          v.lastVisitedAt ? new Date(v.lastVisitedAt).toLocaleString() : (v.createdAt ? new Date(v.createdAt).toLocaleString() : "N/A"),
          v.createdAt ? new Date(v.createdAt).toLocaleString() : "N/A",
          "Profile Visited"
        ]);

        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        ws["!cols"] = [
          { wch: 22 },
          { wch: 18 },
          { wch: 24 },
          { wch: 26 },
          { wch: 16 },
          { wch: 12 },
          { wch: 22 },
          { wch: 22 },
          { wch: 16 }
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Profile Visits");
        const filename = `Doctor_Profile_Visits_${this.selectedRange}_${new Date().toISOString().slice(0, 10)}.xlsx`;
        XLSX.writeFile(wb, filename);

        this.exporting = false;
        if (this.toastr) {
          this.toastr.success(`Exported ${dataset.length} records to ${filename}`, "Export Successful");
        }
      },
      error: () => {
        this.exporting = false;
        if (this.toastr) {
          this.toastr.error("Failed to export records", "Export Error");
        }
      }
    });
  }

  viewDetails(visit: any): void {
    this.selectedVisit = visit;
  }

  closeDetails(): void {
    this.selectedVisit = null;
  }

  copyToClipboard(text: string, key: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (!text || text === "N/A") return;

    navigator.clipboard.writeText(text).then(() => {
      this.copiedKey = key;
      setTimeout(() => {
        if (this.copiedKey === key) {
          this.copiedKey = "";
        }
      }, 2000);
      if (this.toastr) {
        this.toastr.success("Copied to clipboard!", "Copied");
      }
    });
  }

  getInitials(name: string): string {
    if (!name) return "P";
    const clean = name.replace(/^Dr\.?\s*/i, "").trim();
    const parts = clean.split(" ").filter(p => p.length > 0);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase();
  }

  getShowingStart(): number {
    if (this.total === 0) return 0;
    return (this.page - 1) * this.pageSize + 1;
  }

  getShowingEnd(): number {
    return Math.min(this.page * this.pageSize, this.total);
  }

  statusLabel(status: number): string {
    return status === 3 ? "Visited Only" : "Active Visit";
  }
}

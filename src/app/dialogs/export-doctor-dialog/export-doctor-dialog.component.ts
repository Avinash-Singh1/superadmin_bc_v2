import { Component, Inject, Injectable, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { DateAdapter, MAT_DATE_FORMATS, NativeDateAdapter } from "@angular/material/core";

export interface ExportDoctorDialogData {
  currentFilters?: any;
}

export interface ExportDoctorResult {
  exportType: "all" | "dateRange";
  startDate?: string;
  endDate?: string;
}

export const CUSTOM_DATE_FORMATS = {
  parse: {
    dateInput: { month: "short", year: "numeric", day: "numeric" },
  },
  display: {
    dateInput: "input",
    monthYearLabel: { year: "numeric", month: "short" },
    dateA11yLabel: { year: "numeric", month: "long", day: "numeric" },
    monthYearA11yLabel: { year: "numeric", month: "long" },
  },
};

@Injectable()
export class CustomDateAdapter extends NativeDateAdapter {
  override format(date: Date, displayFormat: Object): string {
    if (displayFormat === "input") {
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
    return super.format(date, displayFormat);
  }

  override parse(value: any): Date | null {
    if (typeof value === "string") {
      const parts = value.trim().split(/[-::/]+/);
      if (parts.length === 3) {
        const day = Number(parts[0]);
        const month = Number(parts[1]) - 1;
        const year = Number(parts[2]);
        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
          return new Date(year, month, day);
        }
      }
    }
    const timestamp = typeof value === "number" ? value : Date.parse(value);
    return isNaN(timestamp) ? null : new Date(timestamp);
  }
}

@Component({
  selector: "app-export-doctor-dialog",
  templateUrl: "./export-doctor-dialog.component.html",
  styleUrls: ["./export-doctor-dialog.component.scss"],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
  ],
})
export class ExportDoctorDialogComponent implements OnInit {
  exportType: "all" | "dateRange" = "all";
  startDate: Date | null = null;
  endDate: Date | null = null;
  maxDate: Date = new Date();
  activePreset: string = "";

  constructor(
    public dialogRef: MatDialogRef<ExportDoctorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ExportDoctorDialogData
  ) {}

  ngOnInit(): void {}

  setExportType(type: "all" | "dateRange"): void {
    this.exportType = type;
    if (type === "dateRange" && !this.startDate) {
      this.applyPreset("last30");
    }
  }

  applyPreset(preset: "today" | "last7" | "last30" | "thisMonth" | "last90"): void {
    this.activePreset = preset;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (preset) {
      case "today":
        this.startDate = today;
        this.endDate = today;
        break;
      case "last7":
        this.startDate = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
        this.endDate = today;
        break;
      case "last30":
        this.startDate = new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000);
        this.endDate = today;
        break;
      case "thisMonth":
        this.startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        this.endDate = today;
        break;
      case "last90":
        this.startDate = new Date(today.getTime() - 89 * 24 * 60 * 60 * 1000);
        this.endDate = today;
        break;
    }
  }

  onDateChange(): void {
    this.activePreset = "";
  }

  get selectedDaysCount(): number {
    if (!this.startDate || !this.endDate) return 0;
    const diffTime = Math.abs(this.endDate.getTime() - this.startDate.getTime());
    return Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  get isExportDisabled(): boolean {
    if (this.exportType === "all") return false;
    return !this.startDate || !this.endDate || this.startDate > this.endDate;
  }

  confirmExport(): void {
    if (this.isExportDisabled) return;

    const result: ExportDoctorResult = {
      exportType: this.exportType,
      startDate: this.startDate
        ? this.formatDate(this.startDate)
        : undefined,
      endDate: this.endDate
        ? this.formatDate(this.endDate)
        : undefined,
    };
    this.dialogRef.close(result);
  }

  closeModal(): void {
    this.dialogRef.close(null);
  }

  private formatDate(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
}

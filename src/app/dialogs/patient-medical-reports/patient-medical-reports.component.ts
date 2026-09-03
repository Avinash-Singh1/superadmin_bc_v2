import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { URLConstant } from "src/app/apisURL/url";
import { ApiService } from "src/app/shared/api.service";

@Component({
  selector: "app-patient-medical-reports",
  templateUrl: "./patient-medical-reports.component.html",
  styleUrls: ["./patient-medical-reports.component.scss"],
})
export class PatientMedicalReportsComponent implements OnInit {
  reports: any[] = [];
  loading = true;
  error = "";

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { patientId: string; patientName?: string },
    private dialogRef: MatDialogRef<PatientMedicalReportsComponent>,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.apiService.GetData(`${URLConstant.patientMedicalReports}/${this.data.patientId}`, {}).subscribe({
      next: (response: any) => {
        this.reports = response?.result?.data || response?.data?.data || [];
        this.loading = false;
      },
      error: () => {
        this.error = "Medical reports could not be loaded.";
        this.loading = false;
      },
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  openDocument(url: string): void {
    window.open(url, "_blank", "noopener");
  }

  reportType(type: number): string {
    return type === 1 ? "Prescription" : type === 2 ? "Diagnostic report" : type === 3 ? "Invoice / bill" : "Medical document";
  }
}
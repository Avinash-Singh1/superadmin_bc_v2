import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ApiService } from 'src/app/shared/api.service';
import { URLConstant } from 'src/app/apisURL/url';
import { ROUTE_CONSTANT } from 'src/app/constant/routeconstant';

@Component({
  selector: 'app-prescription-detail',
  templateUrl: './prescription-detail.component.html',
  styleUrls: ['./prescription-detail.component.scss'],
})
export class PrescriptionDetailComponent implements OnInit {
  prescription: any = null;
  isLoading = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPrescription(id);
    } else {
      this.goBack();
    }
  }

  loadPrescription(id: string): void {
    this.isLoading = true;
    this.apiService.GetData(`${URLConstant.adminPrescriptionById}/${id}`, {}).subscribe({
      next: (res: any) => {
        this.prescription = res?.data || null;
        if (!this.prescription) {
          this.error = 'Prescription not found.';
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        this.error = err?.message || 'Failed to load prescription.';
        this.isLoading = false;
      },
    });
  }

  goBack(): void {
    this.location.back();
  }

  printPrescription(): void {
    window.print();
  }

  openPdf(): void {
    const url = this.prescription?.generatedPdfUrl || this.prescription?.uploadedPdfUrl;
    if (url) window.open(url, '_blank');
  }

  // ── Helpers ──────────────────────────────────────────────────

  getRxId(): string {
    return this.prescription?.prescriptionId || `RX${this.prescription?._id?.slice(-6)?.toUpperCase()}`;
  }

  formatDate(d: any): string {
    if (!d) return 'N/A';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  getDoctorName(): string {
    const doc = this.prescription?.doctorId;
    if (doc && typeof doc === 'object') return doc?.userId?.fullName || doc?.name || 'N/A';
    return this.prescription?.doctorDetails?.name || 'N/A';
  }

  getPatientName(): string {
    const p = this.prescription?.patientId;
    if (p && typeof p === 'object') return p?.userId?.fullName || '';
    return this.prescription?.patientDetails?.name || 'N/A';
  }

  getMedications(): any[] {
    return this.prescription?.medications || [];
  }

  getLabTests(): any[] {
    const lt = this.prescription?.labTests;
    if (!lt) return [];
    if (typeof lt === 'string') return lt ? [{ testName: lt }] : [];
    return Array.isArray(lt) ? lt : [];
  }

  getStatusClass(): string {
    const s = this.prescription?.status;
    if (s === 'final' || s === 2) return 'badge-final';
    if (s === 'draft' || s === 1) return 'badge-draft';
    if (s === 'cancelled' || s === 3) return 'badge-cancelled';
    return 'badge-default';
  }

  getStatusLabel(): string {
    const s = this.prescription?.status;
    if (typeof s === 'string') {
      const m: Record<string, string> = { draft: 'Draft', final: 'Final', cancelled: 'Cancelled' };
      return m[s] || s;
    }
    const m: Record<number, string> = { 1: 'Active', 2: 'Completed', 3: 'Cancelled' };
    return m[s] || 'Unknown';
  }
}

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
  isUploading = false;
  isRemovingFile = false;
  error = '';
  imageZoomed = false;

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
        // Backend wraps: { result: { data: <prescription> } } or { data: <prescription> }
        this.prescription =
          res?.result?.data ||
          res?.data ||
          res?.result ||
          null;

        if (!this.prescription) {
          this.error = 'Prescription not found.';
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        this.error = err?.message || err?.error?.message || 'Failed to load prescription.';
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

  downloadFile(): void {
    const url = this.prescription?.uploadedPdfUrl;
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = `prescription-${this.getRxId()}.${this.isUploadedImage() ? 'jpg' : 'pdf'}`;
    a.target = '_blank';
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  toggleZoom(): void {
    this.imageZoomed = !this.imageZoomed;
  }

  onAttachmentSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';

    if (!file || !this.prescription?._id) {
      return;
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      this.error = 'Only PDF, JPG, JPEG, and PNG files are allowed.';
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      this.error = 'File size must be 15 MB or smaller.';
      return;
    }

    const formData = new FormData();
    formData.append('prescriptionFile', file);
    this.isUploading = true;
    this.error = '';

    this.apiService.Postdata(
      `${URLConstant.adminPrescriptionUploadFile}/${this.prescription._id}/upload-file`,
      formData,
      {}
    ).subscribe({
      next: (res: any) => {
        this.loadPrescription(this.prescription._id);
        this.isUploading = false;
      },
      error: (err: any) => {
        this.error = err?.message || err?.error?.message || 'Failed to upload prescription file.';
        this.isUploading = false;
      },
    });
  }

  removeAttachment(): void {
    if (!this.prescription?._id || !this.prescription?.uploadedPdfUrl || this.isRemovingFile) {
      return;
    }

    this.isRemovingFile = true;
    this.error = '';

    this.apiService.DeleteData(
      `${URLConstant.adminPrescriptionUploadFile}/${this.prescription._id}/uploaded-file`,
      {}
    ).subscribe({
      next: () => {
        this.loadPrescription(this.prescription._id);
        this.isRemovingFile = false;
      },
      error: (err: any) => {
        this.error = err?.message || err?.error?.message || 'Failed to remove prescription file.';
        this.isRemovingFile = false;
      },
    });
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

  getDoctorQualification(): string {
    return this.prescription?.doctorDetails?.qualification || '';
  }

  getDoctorSpecialization(): string {
    return this.prescription?.doctorDetails?.specialization || '';
  }

  getDoctorRegNo(): string {
    return this.prescription?.doctorDetails?.regNo || '';
  }

  getDoctorPhone(): string {
    return this.prescription?.doctorDetails?.phone || '';
  }

  getPatientName(): string {
    const p = this.prescription?.patientId;
    if (p && typeof p === 'object') return p?.userId?.fullName || '';
    return this.prescription?.patientDetails?.name || 'N/A';
  }

  getPatientAge(): string {
    return this.prescription?.patientDetails?.age ? `${this.prescription.patientDetails.age} yrs` : '';
  }

  getPatientGender(): string {
    return this.prescription?.patientDetails?.gender || '';
  }

  getPatientPhone(): string {
    return this.prescription?.patientDetails?.phone || '';
  }

  getPatientBloodGroup(): string {
    return this.prescription?.patientDetails?.bloodGroup || '';
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

  getPrescriptionTypeLabel(): string {
    const t = this.prescription?.prescriptionType;
    if (t === 'uploaded') return '📎 Uploaded Document';
    if (t === 'both') return '📎 + 💊 Form + Upload';
    return '💊 Digital Prescription';
  }

  hasUploadedFile(): boolean {
    return !!this.prescription?.uploadedPdfUrl;
  }

  hasStructuredContent(): boolean {
    return !!(
      this.prescription?.diagnosis ||
      this.prescription?.chiefComplaint ||
      (this.prescription?.medications?.length > 0) ||
      (this.prescription?.labTests?.length > 0)
    );
  }

  isUploadedImage(): boolean {
    return /\.(png|jpe?g)(\?|#|$)/i.test(this.prescription?.uploadedPdfUrl || '');
  }
}

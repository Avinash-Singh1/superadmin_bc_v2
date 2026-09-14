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
    const printContent =
      document.getElementById('admin-rx-document') ||
      document.querySelector('.rx-document') ||
      document.querySelector('.prescription-document');

    if (printContent) {
      const printWindow = window.open('', '_blank', 'height=900,width=900');
      if (printWindow) {
        printWindow.document.write('<!DOCTYPE html><html><head><title>Prescription - Bookcure Health</title>');
        printWindow.document.write('<style>');
        printWindow.document.write(`
          * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 15px; color: #1e293b; background: #fff; }
          .rx-document, .prescription-document { max-width: 880px; margin: 0 auto; background: #fff; padding: 24px; position: relative; overflow: hidden; border: none; box-shadow: none; }
          .rx-watermark, .prescription-watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 48px; font-weight: 900; color: rgba(37, 99, 235, 0.05); text-transform: uppercase; letter-spacing: 8px; pointer-events: none; user-select: none; z-index: 0; white-space: nowrap; font-family: Arial, sans-serif; display: flex !important; flex-direction: column; align-items: center; justify-content: center; width: 100%; }
          .rx-watermark__icon svg { width: 200px; height: 200px; color: rgba(37, 99, 235, 0.05); }
          .rx-watermark__text { font-size: 3rem; font-weight: 900; letter-spacing: 8px; color: rgba(37, 99, 235, 0.05); margin-top: 8px; }
          .rx-letterhead, .doc-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; margin-bottom: 12px; }
          .rx-letterhead__logo { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
          .rx-logo-text { font-size: 1.3rem; font-weight: 900; color: #2563eb; }
          .rx-logo-sub { color: #0f172a; font-weight: 700; margin-left: 2px; }
          .rx-doctor-name, .doc-name { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 3px 0; }
          .rx-doctor-quals, .doc-specialization { font-size: 13px; color: #2563eb; margin: 2px 0; font-weight: 600; }
          .rx-doctor-reg, .doc-qualification { font-size: 12px; color: #64748b; margin: 2px 0; }
          .rx-clinic-name, .clinic-info strong { font-size: 15px; font-weight: 800; color: #0f172a; }
          .rx-clinic-detail, .clinic-info p { font-size: 12px; color: #64748b; margin: 2px 0; line-height: 1.5; }
          .rx-doc-meta-row { display: flex; gap: 8px; margin-top: 6px; }
          .rx-meta-tag { font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 4px; background: #eff6ff; color: #1d4ed8; }
          .rx-divider-primary, .doc-divider { height: 3px; background: linear-gradient(90deg, #2563eb, #3b82f6); margin: 12px 0 14px; border-radius: 2px; }
          .rx-patient-strip, .patient-details { background: #f8fafc; padding: 12px 16px; border-radius: 8px; margin: 12px 0; border: 1px solid #e2e8f0; border-left: 4px solid #2563eb; display: flex; flex-wrap: wrap; gap: 16px 24px; }
          .rx-ps-label, .detail-label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; display: block; }
          .rx-ps-value, .detail-value { font-size: 14px; font-weight: 800; color: #0f172a; }
          .rx-vitals-strip { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 8px 14px; margin: 12px 0; display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
          .rx-vitals-label { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #15803d; }
          .rx-vital-pill { background: #fff; border: 1px solid #86efac; border-radius: 4px; padding: 2px 8px; font-size: 12px; }
          .rx-clinical-section, .assessment-section { background: #fafbff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; margin: 12px 0; }
          .rx-section-title { font-size: 13px; font-weight: 800; color: #1e3a8a; border-bottom: 1.5px solid #dbeafe; padding-bottom: 4px; margin: 14px 0 8px; display: flex; align-items: center; gap: 6px; }
          .rx-symbol { font-size: 1.4rem; font-weight: 900; color: #2563eb; font-family: serif; }
          .rx-med-table, .medications-table table { width: 100%; border-collapse: collapse; font-size: 12px; margin: 10px 0; }
          .rx-med-table thead, .medications-table thead { background: #f8fafc; color: #475569; }
          .rx-med-table th, .medications-table th { padding: 8px 10px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #475569; border-bottom: 2px solid #cbd5e1; }
          .rx-med-table td, .medications-table td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; color: #334155; }
          .rx-freq-pill { background: #eff6ff; color: #1d4ed8; padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 11px; }
          .rx-advice-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 10px 0; }
          .rx-advice-item, .additional-section { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 12px; font-size: 12px; }
          .rx-notes-followup-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 12px 0; }
          .rx-followup-card, .rx-doctor-notes-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 12px; }
          .rx-footer-signature-row, .prescription-footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 24px; padding-top: 14px; border-top: 1px solid #e2e8f0; }
          .rx-signature-block, .signature-section { text-align: right; min-width: 180px; }
          .rx-sig-line, .signature-line { width: 160px; border-top: 1.5px solid #0f172a; margin-left: auto; margin-bottom: 6px; }
          .rx-sig-name, .doctor-name { font-size: 14px; font-weight: 800; color: #0f172a; }
          .rx-document-footer, .footer-note { text-align: center; margin-top: 14px; font-size: 11px; color: #94a3b8; }
          .no-print { display: none !important; }
          @page { size: A4; margin: 10mm; }
        `);
        printWindow.document.write('</style></head><body>');
        printWindow.document.write(printContent.outerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 300);
        return;
      }
    }
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

  getHospitalName(): string {
    return (
      this.prescription?.doctorDetails?.hospitalName ||
      this.prescription?.clinicDetails?.name ||
      this.prescription?.hospitalDetails?.name ||
      'Bookcure Health'
    );
  }

  getDoctorLocation(): string {
    return (
      this.prescription?.doctorDetails?.hospitalAddress ||
      this.prescription?.doctorDetails?.address ||
      this.prescription?.clinicDetails?.address ||
      ''
    );
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

  hasVitals(): boolean {
    const v = this.prescription?.vitalSigns;
    if (!v) return false;
    return !!(
      v.bloodPressure ||
      v.bp ||
      v.pulse ||
      v.temperature ||
      v.temp ||
      v.weight ||
      v.height ||
      v.spo2 ||
      v.sugar ||
      v.bloodSugar
    );
  }

  getMedications(): any[] {
    return this.prescription?.medications || [];
  }

  hasMedications(): boolean {
    return Array.isArray(this.prescription?.medications) && this.prescription.medications.length > 0;
  }

  getLabTests(): any[] {
    return this.getLabTestsList();
  }

  getLabTestsList(): any[] {
    const lt = this.prescription?.labTests;
    if (!lt) return [];
    if (typeof lt === 'string') return [{ testName: lt, urgency: 'routine' }];
    if (Array.isArray(lt)) {
      return lt.map(item => {
        if (typeof item === 'string') return { testName: item, urgency: 'routine' };
        return item;
      });
    }
    return [];
  }

  hasLabTests(): boolean {
    return this.getLabTestsList().length > 0;
  }

  hasAdvice(): boolean {
    const a = this.prescription?.advice;
    if (!a) return false;
    if (typeof a === 'string') return a.trim().length > 0;
    return !!(
      a.diet ||
      a.exercise ||
      a.precautions ||
      a.generalInstructions ||
      a.emergencyWarningSigns ||
      a.referralNotes
    );
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
      (this.prescription?.labTests?.length > 0) ||
      this.hasAdvice()
    );
  }

  isUploadOnly(): boolean {
    const t = this.prescription?.prescriptionType;
    if (t) return t === 'uploaded';
    return !this.hasStructuredContent() && !!this.prescription?.uploadedPdfUrl;
  }

  isUploadedImage(): boolean {
    return /\.(png|jpe?g)(\?|#|$)/i.test(this.prescription?.uploadedPdfUrl || '');
  }
}

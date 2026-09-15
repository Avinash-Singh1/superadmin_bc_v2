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
        printWindow.document.write('<!DOCTYPE html><html><head><title>Prescription - BookCure.in</title>');
        printWindow.document.write('<style>');
        printWindow.document.write(`
          * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; margin: 0; padding: 15px; color: #1e293b; background: #fff; }
          .rx-document { max-width: 820px; margin: 0 auto; background: #fff; padding: 30px 40px; position: relative; overflow: hidden; border: none; box-shadow: none; }
          .rx-decor-top-right { position: absolute; top: 0; right: 0; pointer-events: none; }
          .rx-watermark { position: absolute; top: 52%; left: 50%; transform: translate(-50%, -50%) rotate(-32deg); opacity: 0.055; pointer-events: none; user-select: none; z-index: 0; display: flex; align-items: center; justify-content: center; width: 120%; }
          .rx-watermark__text { font-size: 3.4rem; font-weight: 900; letter-spacing: 7px; color: #0f4c81; white-space: nowrap; text-transform: uppercase; }
          .rx-brand-header { margin-bottom: 24px; position: relative; z-index: 1; }
          .rx-brand-logo-wrap { display: flex; align-items: center; gap: 12px; }
          .rx-brand-name { font-size: 26px; font-weight: 800; color: #0a2540; line-height: 1.1; letter-spacing: -0.5px; }
          .rx-brand-dot-in { color: #008080; font-weight: 800; }
          .rx-brand-slogan { font-size: 8.5px; font-weight: 700; letter-spacing: 2px; color: #0284c7; text-transform: uppercase; margin-top: 3px; }
          .rx-doc-info-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; margin-bottom: 20px; position: relative; z-index: 1; }
          .rx-doc-left { flex: 1; }
          .rx-doc-name { font-size: 22px; font-weight: 800; color: #0a2540; margin: 0 0 4px 0; letter-spacing: -0.3px; }
          .rx-doc-quals { font-size: 13.5px; font-weight: 500; color: #475569; margin-bottom: 3px; }
          .rx-doc-reg { font-size: 13px; font-weight: 500; color: #475569; }
          .rx-doc-meta-card { border: 1.5px solid #dce4ee; border-radius: 8px; overflow: hidden; min-width: 230px; background: #ffffff; }
          .rx-meta-grid-row { display: flex; border-bottom: 1px solid #dce4ee; }
          .rx-meta-grid-row:last-child { border-bottom: none; }
          .rx-meta-cell { padding: 6px 12px; font-size: 12.5px; display: flex; align-items: center; }
          .rx-meta-cell--label { background: #f8fafc; border-right: 1px solid #dce4ee; color: #0a2540; font-weight: 600; width: 85px; gap: 6px; }
          .rx-meta-cell--value { flex: 1; color: #334155; font-weight: 500; }
          .rx-meta-cell--rx { font-weight: 700; color: #0a2540; letter-spacing: 0.5px; }
          .rx-patient-info-strip { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px 28px; margin-bottom: 18px; position: relative; z-index: 1; }
          .rx-patient-row { display: flex; align-items: center; gap: 10px; }
          .rx-p-icon { width: 22px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
          .rx-p-text { font-size: 13px; display: flex; gap: 6px; flex-wrap: wrap; }
          .rx-p-label { font-weight: 700; color: #0a2540; }
          .rx-p-val { color: #334155; font-weight: 500; }
          .rx-vitals-container { border: 1px solid #bae6fd; border-radius: 8px; overflow: hidden; margin-bottom: 20px; position: relative; z-index: 1; }
          .rx-vitals-header { background: #0f2942; color: #ffffff; padding: 6px 14px; font-size: 12.5px; font-weight: 700; display: flex; align-items: center; gap: 6px; }
          .rx-vitals-body { background: #f0f9ff; padding: 8px 16px; display: flex; align-items: center; justify-content: space-around; flex-wrap: wrap; gap: 12px 18px; }
          .rx-vital-item { display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: #0a2540; }
          .rx-vital-name { font-weight: 700; color: #0a2540; }
          .rx-vital-value { font-weight: 500; color: #334155; }
          .rx-clinical-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 22px; position: relative; z-index: 1; }
          .rx-clinical-item { display: flex; align-items: flex-start; gap: 12px; }
          .rx-c-badge { width: 32px; height: 32px; border-radius: 50%; background: #e0f2fe; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
          .rx-c-content { flex: 1; }
          .rx-c-title { font-size: 13.5px; font-weight: 700; color: #0a2540; margin: 0 0 2px 0; }
          .rx-c-desc { font-size: 13px; color: #475569; margin: 0; line-height: 1.4; }
          .rx-symptom-tag { display: inline-block; background: #f1f5f9; border: 1px solid #e2e8f0; padding: 2px 8px; border-radius: 4px; margin-right: 6px; font-size: 12px; }
          .rx-section-block { margin-bottom: 22px; position: relative; z-index: 1; }
          .rx-block-heading { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
          .rx-block-title { font-size: 15px; font-weight: 800; color: #0a2540; }
          .rx-table-container { border-radius: 6px; overflow: hidden; border: 1px solid #dce4ee; }
          .rx-table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
          .rx-table thead tr { background: #0f4c81; color: #ffffff; }
          .rx-table th { padding: 9px 12px; font-weight: 600; text-align: left; border-right: 1px solid rgba(255, 255, 255, 0.15); font-size: 12px; }
          .rx-table th:last-child { border-right: none; }
          .rx-table tbody tr { border-bottom: 1px solid #e2e8f0; background: #ffffff; }
          .rx-table tbody tr:nth-child(even) { background: #fafcff; }
          .rx-table tbody tr:last-child { border-bottom: none; }
          .rx-table td { padding: 10px 12px; vertical-align: middle; color: #334155; border-right: 1px solid #f1f5f9; }
          .rx-table td:last-child { border-right: none; }
          .rx-med-name { font-weight: 700; color: #0a2540; font-size: 13px; }
          .rx-med-sub { font-size: 11.5px; color: #64748b; margin-top: 1px; }
          .rx-freq-timing { font-size: 11px; color: #0284c7; font-weight: 600; margin-top: 1px; }
          .rx-sub-badge { display: inline-block; font-size: 10.5px; color: #059669; background: #ecfdf5; border: 1px solid #a7f3d0; padding: 1px 6px; border-radius: 4px; margin-top: 3px; }
          .rx-advice-banner { background: #e0f2fe; color: #0369a1; padding: 7px 14px; border-radius: 6px; font-size: 13.5px; font-weight: 700; display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
          .rx-advice-list { display: flex; flex-direction: column; gap: 8px; }
          .rx-advice-item { display: flex; align-items: center; gap: 10px; }
          .rx-advice-num { width: 20px; height: 20px; border-radius: 50%; background: #0d9488; color: #ffffff; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
          .rx-advice-content { font-size: 13px; color: #334155; line-height: 1.4; }
          .rx-followup-row { margin-top: 14px; display: flex; flex-direction: column; gap: 6px; font-size: 12.5px; color: #475569; position: relative; z-index: 1; }
          .rx-followup-box, .rx-notes-box { background: #f8fafc; padding: 6px 12px; border-radius: 6px; border-left: 3px solid #0284c7; }
          .rx-followup-box strong, .rx-notes-box strong { color: #0a2540; }
          .rx-bottom-sig-row { display: flex; justify-content: flex-end; margin-top: 24px; margin-bottom: 20px; position: relative; z-index: 1; }
          .rx-sig-container { text-align: right; min-width: 220px; }
          .rx-sig-handwriting { font-family: "Brush Script MT", "Caveat", "Dancing Script", cursive; font-size: 26px; color: #0f4c81; margin-bottom: 4px; }
          .rx-sig-img { max-height: 48px; object-fit: contain; margin-bottom: 4px; }
          .rx-sig-line { border-bottom: 1.5px solid #0f4c81; width: 100%; margin-bottom: 5px; }
          .rx-sig-title { font-size: 12.5px; font-weight: 800; color: #0a2540; }
          .rx-sig-doc-detail { font-size: 11.5px; color: #475569; margin-top: 1px; }
          .rx-sig-clinic { font-size: 10.5px; font-weight: 700; color: #0284c7; letter-spacing: 0.5px; margin-top: 1px; }
          .rx-bottom-footer { border-top: 1.5px solid #e2e8f0; padding-top: 10px; display: flex; justify-content: space-between; align-items: center; position: relative; margin-top: 16px; z-index: 1; }
          .rx-footer-tagline { font-size: 12px; font-weight: 500; color: #64748b; letter-spacing: 1.5px; }
          .rx-decor-bottom-right { display: flex; align-items: center; }
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

  getDoctorSignatureUrl(): string {
    return (
      this.prescription?.signatureImage ||
      this.prescription?.doctorDetails?.signatureUrl ||
      (this.prescription?.doctorId && typeof this.prescription.doctorId === 'object' && this.prescription.doctorId.signatureUrl) ||
      ''
    );
  }

  getDoctorStampUrl(): string {
    return (
      this.prescription?.stampImage ||
      this.prescription?.doctorDetails?.stampUrl ||
      (this.prescription?.doctorId && typeof this.prescription.doctorId === 'object' && this.prescription.doctorId.stampUrl) ||
      ''
    );
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

  getVitalDisplay(key: string): string | null {
    const v = this.prescription?.vitalSigns as any;
    if (!v) return null;
    switch (key) {
      case 'bloodPressure': return v.bloodPressure || v.bp || null;
      case 'pulse': return v.pulse || v.heartRate || null;
      case 'temperature': return v.temperature || v.temp || null;
      case 'spo2': return v.spo2 || v.oxygen || null;
      case 'weight': return v.weight || null;
      case 'height': return v.height || null;
      case 'bmi': return v.bmi || null;
      case 'bloodSugar': return v.bloodSugar || v.sugar || v.glucose || v.rbs || v.fbs || null;
      case 'respiratoryRate': return v.respiratoryRate || v.rr || null;
      default: return v[key] || null;
    }
  }

  getAdviceList(): string[] {
    const a: any = this.prescription?.advice;
    if (!a) return [];
    if (typeof a === 'string') {
      return a.split(/\r?\n/).map((s: string) => s.trim()).filter((s: string) => s.length > 0);
    }
    const list: string[] = [];
    if (a.diet) list.push(`Diet: ${a.diet}`);
    if (a.exercise) list.push(`Exercise: ${a.exercise}`);
    if (a.lifestyle) list.push(`Lifestyle: ${a.lifestyle}`);
    if (a.precautions) list.push(`Precautions: ${a.precautions}`);
    if (a.generalInstructions) list.push(a.generalInstructions);
    if (a.restrictions) list.push(`Restrictions: ${a.restrictions}`);
    if (a.emergencyWarningSigns) list.push(`Warning Signs: ${a.emergencyWarningSigns}`);
    if (a.referralNotes) list.push(`Referral: ${a.referralNotes}`);
    if (a.other) list.push(a.other);
    return list;
  }

  hasAdvice(): boolean {
    return this.getAdviceList().length > 0;
  }

  hasAllergies(): boolean {
    const a = this.prescription?.allergies;
    if (!a) return false;
    if (Array.isArray(a)) return a.length > 0;
    return !!String(a).trim();
  }

  getAllergiesDisplay(): string {
    const a = this.prescription?.allergies;
    if (!a) return '';
    if (Array.isArray(a)) return a.join(', ');
    return String(a);
  }

  hasSymptoms(): boolean {
    const s = this.prescription?.symptoms;
    if (!s) return false;
    if (Array.isArray(s)) return s.length > 0;
    return !!String(s).trim();
  }

  getSymptomsList(): string[] {
    const s = this.prescription?.symptoms;
    if (!s) return [];
    if (Array.isArray(s)) return s;
    return String(s).split(',').map((item: string) => item.trim()).filter(Boolean);
  }

  hasFollowUp(): boolean {
    const f: any = this.prescription?.followUp;
    const fd = (this.prescription as any)?.followUpDate;
    return !!(fd || f?.date || f?.notes || f?.instructions);
  }

  get followUpDate(): Date | string | null {
    return this.prescription?.followUp?.date || (this.prescription as any)?.followUpDate || null;
  }

  get followUpNotes(): string {
    return this.prescription?.followUp?.notes || (this.prescription?.followUp as any)?.instructions || '';
  }

  timingLabel(val: any): string {
    if (!val) return '';
    if (Array.isArray(val)) {
      return val.map((v) => this.timingLabel(v)).filter(Boolean).join(', ');
    }
    const str = String(val).trim();
    const map: Record<string, string> = {
      before_food: 'Before Food',
      after_food: 'After Food',
      empty_stomach: 'Empty Stomach',
      with_food: 'With Food',
    };
    return map[str] || str;
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

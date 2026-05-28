import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/shared/api.service';
import { URLConstant } from 'src/app/apisURL/url';
import { ROUTE_CONSTANT } from 'src/app/constant/routeconstant';

@Component({
  selector: 'app-prescription-list',
  templateUrl: './prescription-list.component.html',
  styleUrls: ['./prescription-list.component.scss'],
})
export class PrescriptionListComponent implements OnInit {
  prescriptions: any[] = [];
  isLoading = false;
  error = '';

  // Pagination
  page = 1;
  size = 20;
  total = 0;

  // Filters
  searchText = '';
  statusFilter = '';
  dateFrom = '';
  dateTo = '';

  constructor(private router: Router, private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadPrescriptions();
  }

  loadPrescriptions(): void {
    this.isLoading = true;
    this.error = '';

    const params: any = { page: this.page, size: this.size };
    if (this.searchText) params.search = this.searchText;
    if (this.statusFilter) params.status = this.statusFilter;
    if (this.dateFrom) params.dateFrom = this.dateFrom;
    if (this.dateTo) params.dateTo = this.dateTo;

    this.apiService.GetData(URLConstant.adminPrescriptionList, params).subscribe({
      next: (res: any) => {
        this.prescriptions = res?.data?.prescriptions || res?.data || [];
        this.total = res?.data?.count || 0;
        this.isLoading = false;
      },
      error: (err: any) => {
        this.error = err?.message || 'Failed to load prescriptions.';
        this.isLoading = false;
      },
    });
  }

  applyFilters(): void {
    this.page = 1;
    this.loadPrescriptions();
  }

  clearFilters(): void {
    this.searchText = '';
    this.statusFilter = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.applyFilters();
  }

  viewDetail(prescription: any): void {
    this.router.navigate([`/${ROUTE_CONSTANT.THEME}/${ROUTE_CONSTANT.PRESCRIPTION}/detail/${prescription._id}`]);
  }

  onPageChange(event: number): void {
    this.page = event;
    this.loadPrescriptions();
  }

  getStatusClass(status: string | number): string {
    if (status === 'final' || status === 2) return 'badge-final';
    if (status === 'draft' || status === 1) return 'badge-draft';
    if (status === 'cancelled' || status === 3) return 'badge-cancelled';
    return 'badge-default';
  }

  getStatusLabel(status: string | number): string {
    if (typeof status === 'string') {
      const m: Record<string, string> = { draft: 'Draft', final: 'Final', cancelled: 'Cancelled' };
      return m[status] || status;
    }
    const m: Record<number, string> = { 1: 'Active', 2: 'Completed', 3: 'Cancelled' };
    return m[status] || 'Unknown';
  }

  formatDate(d: any): string {
    if (!d) return 'N/A';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  getDoctorName(rx: any): string {
    const doc = rx?.doctorId;
    if (doc && typeof doc === 'object') return doc?.userId?.fullName || doc?.name || 'N/A';
    return rx?.doctorDetails?.name || 'N/A';
  }

  getPatientName(rx: any): string {
    const p = rx?.patientId;
    if (p && typeof p === 'object') return p?.userId?.fullName || '';
    return rx?.patientDetails?.name || 'N/A';
  }
}

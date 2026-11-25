import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Subject, Subscription, debounceTime, distinctUntilChanged, forkJoin, of } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';

import { GlobalsearchService } from 'src/app/shared/globalsearch.service';
import {
  RecycleBinFilters,
  RecycleBinRow,
  RecycleBinService,
  RecycleBinStatusFilter,
  RecycleBinTypeFilter,
} from './recycle-bin.service';
import { RecycleBinConfirmComponent } from './recycle-bin-confirm.component';

@Component({
  selector: 'app-recycle-bin',
  templateUrl: './recycle-bin.component.html',
  styleUrls: ['./recycle-bin.component.scss'],
  })
export class RecycleBinComponent implements OnInit, OnDestroy {
  rows: RecycleBinRow[] = [];
  total = 0;
  loading = false;
  bulkLoading = false;

  selectedIds = new Set<string>();

  filters: RecycleBinFilters = {
    type: 'all',
    status: 'all',
    search: '',
    sort: 'createdAt',
    sortOrder: 'DESC',
    page: 1,
    size: 20,
  };

  readonly typeOptions: { label: string; value: RecycleBinTypeFilter }[] = [
    { label: 'All Types', value: 'all' },
    { label: 'Patient', value: 'patient' },
    { label: 'Doctor', value: 'doctor' },
    { label: 'Hospital', value: 'hospital' },
    { label: 'Establishment', value: 'establishment' },
  ];

  readonly statusOptions: { label: string; value: RecycleBinStatusFilter }[] = [
    { label: 'All Status', value: 'all' },
    { label: 'Deleted', value: 'deleted' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'Inactive', value: 'inactive' },
  ];

  searchControl = new UntypedFormControl('');

  private destroy$ = new Subject<void>();
  private globalSearchSub?: Subscription;

  constructor(
    private service: RecycleBinService,
    private dialog: MatDialog,
    private toastr: ToastrService,
    private globalSearch: GlobalsearchService
  ) {}

  ngOnInit(): void {
    // Local search input
    this.searchControl.valueChanges
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((value: string) => {
        this.filters.search = (value || '').trim();
        this.filters.page = 1;
        this.load();
      });

    // Wrapper header search (shared)
    this.globalSearchSub = this.globalSearch
      .getSearchValue()
      .pipe(debounceTime(350), distinctUntilChanged())
      .subscribe((value: string) => {
        if (value === this.filters.search) return;
        this.filters.search = (value || '').trim();
        this.filters.page = 1;
        this.load();
      });

    this.load();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.globalSearchSub?.unsubscribe();
  }

  load(): void {
    this.loading = true;
    this.selectedIds.clear();
    this.service.list(this.filters).subscribe({
      next: (res: any) => {
        this.loading = false;
        const payload = res?.data || res?.result || {};
        this.rows = payload.data || [];
        this.total = payload.pagination?.total || 0;
      },
      error: (err: any) => {
        this.loading = false;
        this.toastr.error(err?.message || 'Failed to load recycle bin');
      },
    });
  }

  onTypeChange(value: RecycleBinTypeFilter): void {
    this.filters.type = value;
    this.filters.page = 1;
    this.load();
  }

  onStatusChange(value: RecycleBinStatusFilter): void {
    this.filters.status = value;
    this.filters.page = 1;
    this.load();
  }

  sortBy(field: 'createdAt' | 'name' | 'status' | 'type'): void {
    if (this.filters.sort === field) {
      this.filters.sortOrder = this.filters.sortOrder === 'ASC' ? 'DESC' : 'ASC';
    } else {
      this.filters.sort = field;
      this.filters.sortOrder = 'ASC';
    }
    this.filters.page = 1;
    this.load();
  }

  sortIndicator(field: string): string {
    if (this.filters.sort !== field) return '';
    return this.filters.sortOrder === 'ASC' ? '▲' : '▼';
  }

  pageChanged(page: number): void {
    this.filters.page = page;
    this.load();
  }

  statusLabel(row: RecycleBinRow): string {
    switch (row.derivedStatus) {
      case 'deleted': return 'Deleted';
      case 'rejected': return 'Rejected';
      case 'inactive': return 'Inactive';
      default: return 'Unknown';
    }
  }

  typeLabel(row: RecycleBinRow): string {
    return row.userTypeLabel ? row.userTypeLabel.charAt(0).toUpperCase() + row.userTypeLabel.slice(1) : '—';
  }

  metadata(row: RecycleBinRow): string {
    if (row.userTypeLabel === 'doctor') return row.specialty || '—';
    if (row.userTypeLabel === 'hospital') return row.cityName || '—';
    if (row.userTypeLabel === 'establishment') return row.cityName || '—';
    if (row.userTypeLabel === 'patient') {
      const parts: string[] = [];
      if (row.gender === 1) parts.push('Male');
      else if (row.gender === 2) parts.push('Female');
      else if (row.gender === 3) parts.push('Other');
      if (row.cityName) parts.push(row.cityName);
      return parts.length ? parts.join(' • ') : '—';
    }
    return '—';
  }

  initials(row: RecycleBinRow): string {
    const name = (row.displayName || '').trim();
    if (!name) return '—';
    const parts = name.split(/\s+/);
    return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase();
  }

  trackById = (_: number, row: RecycleBinRow) => row._id;

  confirmDelete(row: RecycleBinRow): void {
    const ref = this.dialog.open(RecycleBinConfirmComponent, {
      width: '460px',
      data: {
        title: 'Permanently delete?',
        message: `${row.displayName || 'This record'} (${this.typeLabel(row)}) will be permanently removed from the database along with all related records. This cannot be undone.`,
        confirmLabel: 'Delete Permanently',
        confirmClass: 'danger',
      },
    });
    ref.afterClosed().subscribe((ok: boolean) => {
      if (!ok) return;
      this.service.permanentDelete(row).subscribe({
        next: (res: any) => {
          const code = res?.msgCode || '';
          if (code && code.includes('DELETED')) {
            this.toastr.success('Record permanently deleted');
          } else if (res?.success === false) {
            this.toastr.error(code || 'Delete failed');
            return;
          } else {
            this.toastr.success('Record permanently deleted');
          }
          this.load();
        },
        error: (err: any) => {
          this.toastr.error(err?.error?.msgCode || err?.message || 'Delete failed');
        },
      });
    });
  }

  confirmRestore(row: RecycleBinRow): void {
    const ref = this.dialog.open(RecycleBinConfirmComponent, {
      width: '460px',
      data: {
        title: 'Restore record?',
        message: `${row.displayName || 'This record'} (${this.typeLabel(row)}) will be reactivated and moved out of the recycle bin.`,
        confirmLabel: 'Restore',
        confirmClass: 'primary',
      },
    });
    ref.afterClosed().subscribe((ok: boolean) => {
      if (!ok) return;
      this.service.restore(row).subscribe({
        next: (res: any) => {
          if (res?.success === false) {
            this.toastr.error(res?.msgCode || 'Restore failed');
            return;
          }
          this.toastr.success('Record restored');
          this.load();
        },
        error: (err: any) => {
          this.toastr.error(err?.error?.msgCode || err?.message || 'Restore failed');
        },
      });
    });
  }

  // ---------- Bulk selection ----------

  isSelected(id: string): boolean {
    return this.selectedIds.has(id);
  }

  toggleRow(row: RecycleBinRow): void {
    if (this.selectedIds.has(row._id)) this.selectedIds.delete(row._id);
    else this.selectedIds.add(row._id);
  }

  get allSelected(): boolean {
    return this.rows.length > 0 && this.rows.every(r => this.selectedIds.has(r._id));
  }

  get someSelected(): boolean {
    return this.selectedIds.size > 0 && !this.allSelected;
  }

  toggleAll(): void {
    if (this.allSelected) {
      this.rows.forEach(r => this.selectedIds.delete(r._id));
    } else {
      this.rows.forEach(r => this.selectedIds.add(r._id));
    }
  }

  clearSelection(): void {
    this.selectedIds.clear();
  }

  get selectedRows(): RecycleBinRow[] {
    return this.rows.filter(r => this.selectedIds.has(r._id));
  }

  bulkConfirmDelete(): void {
    const targets = this.selectedRows;
    if (!targets.length) return;
    const ref = this.dialog.open(RecycleBinConfirmComponent, {
      width: '480px',
      data: {
        title: `Permanently delete ${targets.length} record${targets.length === 1 ? '' : 's'}?`,
        message: `${targets.length} selected record${targets.length === 1 ? '' : 's'} will be permanently removed from the database along with all related records. This cannot be undone.`,
        confirmLabel: 'Delete All',
        confirmClass: 'danger',
      },
    });
    ref.afterClosed().subscribe((ok: boolean) => {
      if (!ok) return;
      this.runBulk(
        targets.map(row =>
          this.service.permanentDelete(row).pipe(catchError((err: any) => of({ __error: true, err, row })))
        ),
        'deleted'
      );
    });
  }

  bulkConfirmRestore(): void {
    const targets = this.selectedRows;
    if (!targets.length) return;
    const ref = this.dialog.open(RecycleBinConfirmComponent, {
      width: '480px',
      data: {
        title: `Restore ${targets.length} record${targets.length === 1 ? '' : 's'}?`,
        message: `${targets.length} selected record${targets.length === 1 ? '' : 's'} will be reactivated and moved out of the recycle bin.`,
        confirmLabel: 'Restore All',
        confirmClass: 'primary',
      },
    });
    ref.afterClosed().subscribe((ok: boolean) => {
      if (!ok) return;
      this.runBulk(
        targets.map(row =>
          this.service.restore(row).pipe(catchError((err: any) => of({ __error: true, err, row })))
        ),
        'restored'
      );
    });
  }

  private runBulk(observables: any[], verb: 'deleted' | 'restored'): void {
    this.bulkLoading = true;
    forkJoin(observables).subscribe({
      next: (results: any[]) => {
        this.bulkLoading = false;
        let success = 0;
        let failed = 0;
        results.forEach((res: any) => {
          if (res?.__error || res?.success === false) failed++;
          else success++;
        });
        if (success) this.toastr.success(`${success} record${success === 1 ? '' : 's'} ${verb}`);
        if (failed) this.toastr.error(`${failed} record${failed === 1 ? '' : 's'} failed to ${verb === 'deleted' ? 'delete' : 'restore'}`);
        this.load();
      },
      error: (err: any) => {
        this.bulkLoading = false;
        this.toastr.error(err?.error?.msgCode || err?.message || `Bulk ${verb === 'deleted' ? 'delete' : 'restore'} failed`);
      },
    });
  }
}

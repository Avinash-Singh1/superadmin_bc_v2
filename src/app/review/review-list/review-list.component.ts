import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { URLConstant } from 'src/app/apisURL/url';
import { ApiService } from 'src/app/shared/api.service';

@Component({ selector: 'app-review-list', templateUrl: './review-list.component.html', styleUrls: ['./review-list.component.scss'] })
export class ReviewListComponent implements OnInit {
  reviews: any[] = []; summary: any = {}; loading = false; error = ''; selected: any = null;
  filters: any = { page: 1, size: 20, status: 'all', rating: '', search: '', reported: '', verified: '', sort: 'recent', city: '', fromDate: '', toDate: '' };
  action: any = null; reason = ''; note = ''; saving = false;
  constructor(private api: ApiService, private toastr: ToastrService) {}
  ngOnInit(): void { this.load(); }
  load(page = 1): void {
    this.loading = true; this.error = ''; this.filters.page = page; const params: any = {};
    Object.keys(this.filters).forEach(key => { if (this.filters[key] !== '') params[key] = this.filters[key]; });
    this.api.GetData(URLConstant.reviewManagement, params).subscribe({ next: (res: any) => { this.reviews = res?.result?.reviews || []; this.summary = res?.result?.summary || {}; this.loading = false; }, error: (err: any) => { this.error = err?.message || 'Review management data could not be loaded.'; this.loading = false; } });
  }
  view(review: any): void { this.api.GetData(`${URLConstant.reviewManagementDetail}/${review._id}`, {}).subscribe({ next: (res: any) => this.selected = res?.result, error: () => this.toastr.error('Review details could not be loaded.') }); }
  close(): void { if (!this.saving) { this.selected = null; this.action = null; this.reason = ''; this.note = ''; } }
  requestAction(action: string, review: any): void { this.selected = review; this.action = action; this.reason = ''; this.note = ''; }
  moderate(): void {
    if (!this.selected || !this.action || this.saving) return;
    if (['reject','hide','remove'].includes(this.action) && this.reason.trim().length < 3) { this.toastr.error('A moderation reason is required.'); return; }
    this.saving = true; this.api.PutData(`${URLConstant.reviewManagementDetail}/${this.selected._id}`, { action: this.action, reason: this.reason, note: this.note }, {}).subscribe({ next: () => { this.toastr.success('Moderation action recorded.'); this.saving = false; this.close(); this.load(this.filters.page); }, error: (e: any) => { this.toastr.error(e?.error?.message || 'Moderation action failed.'); this.saving = false; } });
  }
  status(review: any): string { return review.normalizedStatus || review.moderationStatus || 'pending'; }
  totalPages(): number { return Math.ceil((this.summary.filteredTotal || this.summary.total || 0) / this.filters.size); }
}

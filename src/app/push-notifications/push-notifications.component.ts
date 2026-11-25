import { Component, OnInit, OnDestroy } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError, takeUntil } from 'rxjs/operators';
import { ApiService } from '../shared/api.service';
import { URLConstant } from '../apisURL/url';

export interface UserOption {
  _id: string;
  fullName: string;
  phone: string;
  countryCode?: string;
  userType?: number | number[];
  userTypeLabel?: string;
  createdAt?: string;
}

export interface PresetTemplate {
  label: string;
  icon: string;
  title: string;
  body: string;
}

export interface DispatchHistoryItem {
  _id: string;
  title: string;
  body: string;
  targetType: 'broadcast' | 'user' | 'segment';
  recipientsCount: number;
  createdAt: string;
}

@Component({
  selector: 'app-push-notifications',
  templateUrl: './push-notifications.component.html',
  styleUrls: ['./push-notifications.component.scss'],
})
export class PushNotificationsComponent implements OnInit, OnDestroy {
  selectedTab = 0;

  broadcastForm: FormGroup;
  sendToUserForm: FormGroup;
  sendToSegmentForm: FormGroup;

  // Single user search state
  userSearchControl = new FormControl('');
  userSearchResults: UserOption[] = [];
  userSearching = false;
  selectedUser: UserOption | null = null;
  userSearchFocus = false;
  userRoleFilter: '' | '1' | '2' | '3' = '';

  // Segment multi-user search state
  segmentSearchControl = new FormControl('');
  segmentSearchResults: UserOption[] = [];
  segmentSearching = false;
  selectedSegmentUsers: UserOption[] = [];
  segmentSearchFocus = false;
  segmentRoleFilter: '' | '1' | '2' | '3' = '';
  showManualSegmentIds = false;
  manualIdsControl = new FormControl('');

  // Recent dispatch history
  historyItems: DispatchHistoryItem[] = [];
  historyLoading = false;

  // UI state
  loading = false;
  successMessage = '';
  errorMessage = '';
  previewPlatform: 'android' | 'ios' = 'android';
  imageLoadError = false;

  readonly imageUrlPattern = /^(https?:\/\/).+\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i;

  readonly roleFilters: { label: string; value: '' | '1' | '2' | '3' }[] = [
    { label: 'All Roles', value: '' },
    { label: 'Patients', value: '1' },
    { label: 'Doctors', value: '2' },
    { label: 'Hospitals', value: '3' },
  ];

  readonly deviceTypeOptions: { label: string; value: string }[] = [
    { label: 'All Platforms', value: '' },
    { label: 'Android', value: 'android' },
    { label: 'iOS', value: 'ios' },
    { label: 'Web / Desktop', value: 'desktop' },
  ];

  presetTemplates: PresetTemplate[] = [
    {
      label: 'General Announcement',
      icon: 'campaign',
      title: '📢 Important Update from Nectar Plus',
      body: 'Check out the latest features and healthcare updates available now in your app.',
    },
    {
      label: 'Appointment Reminder',
      icon: 'event_available',
      title: '⏰ Upcoming Consultation Reminder',
      body: 'Please ensure you are ready 5 minutes before your scheduled appointment time.',
    },
    {
      label: 'Health & Wellness Offer',
      icon: 'local_offer',
      title: '🎉 Exclusive Health Package Available',
      body: 'Special consultation packages and health check-ups are now live for you!',
    },
    {
      label: 'System Maintenance',
      icon: 'build',
      title: '⚙️ Scheduled System Maintenance',
      body: 'We will be conducting brief system upgrades tonight between 2:00 AM - 3:00 AM IST.',
    },
  ];

  private destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder, private apiService: ApiService) {
    this.broadcastForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      body: ['', [Validators.required, Validators.maxLength(1000)]],
      imageUrl: ['', [Validators.pattern(this.imageUrlPattern)]],
      deviceType: [''],
    });

    this.sendToUserForm = this.fb.group({
      userId: ['', [Validators.required, Validators.pattern(/^[a-f0-9]{24}$/i)]],
      title: ['', [Validators.required, Validators.maxLength(200)]],
      body: ['', [Validators.required, Validators.maxLength(1000)]],
      imageUrl: ['', [Validators.pattern(this.imageUrlPattern)]],
      deviceType: [''],
    });

    this.sendToSegmentForm = this.fb.group({
      userIds: [[], [Validators.required, this.arrayNotEmptyValidator]],
      title: ['', [Validators.required, Validators.maxLength(200)]],
      body: ['', [Validators.required, Validators.maxLength(1000)]],
      imageUrl: ['', [Validators.pattern(this.imageUrlPattern)]],
      deviceType: [''],
    });
  }

  ngOnInit(): void {
    this.setupUserSearch();
    this.setupSegmentSearch();
    this.fetchInitialUsers();
    this.loadHistory();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private arrayNotEmptyValidator(control: AbstractControl) {
    const val = control.value;
    if (Array.isArray(val) && val.length > 0) return null;
    return { required: true };
  }

  private setupUserSearch(): void {
    this.userSearchControl.valueChanges
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        takeUntil(this.destroy$),
        switchMap((term: string | null) => {
          const query = (term || '').trim();
          this.userSearching = true;
          return this.searchUsersApi(query, this.userRoleFilter).pipe(
            catchError(() => of([]))
          );
        })
      )
      .subscribe((users) => {
        this.userSearching = false;
        this.userSearchResults = users;
      });
  }

  private setupSegmentSearch(): void {
    this.segmentSearchControl.valueChanges
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        takeUntil(this.destroy$),
        switchMap((term: string | null) => {
          const query = (term || '').trim();
          this.segmentSearching = true;
          return this.searchUsersApi(query, this.segmentRoleFilter).pipe(
            catchError(() => of([]))
          );
        })
      )
      .subscribe((users) => {
        this.segmentSearching = false;
        this.segmentSearchResults = users;
      });
  }

  onUserRoleFilterChange(role: '' | '1' | '2' | '3'): void {
    this.userRoleFilter = role;
    this.userSearching = true;
    this.searchUsersApi((this.userSearchControl.value || '').trim(), role)
      .pipe(catchError(() => of([])))
      .subscribe((users) => {
        this.userSearching = false;
        this.userSearchResults = users;
      });
  }

  onSegmentRoleFilterChange(role: '' | '1' | '2' | '3'): void {
    this.segmentRoleFilter = role;
    this.segmentSearching = true;
    this.searchUsersApi((this.segmentSearchControl.value || '').trim(), role)
      .pipe(catchError(() => of([])))
      .subscribe((users) => {
        this.segmentSearching = false;
        this.segmentSearchResults = users;
      });
  }

  private fetchInitialUsers(): void {
    this.searchUsersApi('', '').subscribe({
      next: (users) => {
        this.userSearchResults = users;
        this.segmentSearchResults = users;
      },
      error: () => {},
    });
  }

  private searchUsersApi(term: string, userType: string) {
    const payload: any = { limit: 25 };
    if (term) payload.search = term;
    if (userType) payload.userType = userType;

    return this.apiService.GetData(URLConstant.pushNotificationUsers, payload).pipe(
      switchMap((res: any) => {
        const users = res?.data?.users || res?.result?.users || res?.data || [];
        return of(Array.isArray(users) ? users : []);
      })
    );
  }

  loadHistory(): void {
    this.historyLoading = true;
    this.apiService.GetData(URLConstant.pushNotificationHistory, { limit: 10 }).subscribe({
      next: (res: any) => {
        this.historyLoading = false;
        const list = res?.data?.history || res?.result?.history || [];
        this.historyItems = Array.isArray(list) ? list : [];
      },
      error: () => {
        this.historyLoading = false;
      },
    });
  }

  // ── Single User Selection ──────────────────────────────────────────────
  onSelectUser(user: UserOption): void {
    this.selectedUser = user;
    this.sendToUserForm.patchValue({ userId: user._id });
    this.sendToUserForm.get('userId')?.markAsTouched();
    this.sendToUserForm.get('userId')?.updateValueAndValidity();
    this.userSearchControl.setValue('', { emitEvent: false });
    this.userSearchFocus = false;
  }

  onClearSelectedUser(): void {
    this.selectedUser = null;
    this.sendToUserForm.patchValue({ userId: '' });
    this.sendToUserForm.get('userId')?.markAsTouched();
    this.sendToUserForm.get('userId')?.updateValueAndValidity();
    this.userSearchControl.setValue('');
  }

  // ── Segment User Selection ─────────────────────────────────────────────
  isUserSelectedInSegment(userId: string): boolean {
    return this.selectedSegmentUsers.some((u) => u._id === userId);
  }

  onToggleSegmentUser(user: UserOption): void {
    if (this.isUserSelectedInSegment(user._id)) {
      this.onRemoveSegmentUser(user._id);
    } else {
      this.selectedSegmentUsers.push(user);
      this.syncSegmentForm();
    }
  }

  onRemoveSegmentUser(userId: string): void {
    this.selectedSegmentUsers = this.selectedSegmentUsers.filter((u) => u._id !== userId);
    this.syncSegmentForm();
  }

  onSelectAllSegmentResults(): void {
    this.segmentSearchResults.forEach((user) => {
      if (!this.isUserSelectedInSegment(user._id)) {
        this.selectedSegmentUsers.push(user);
      }
    });
    this.syncSegmentForm();
  }

  onClearAllSegmentUsers(): void {
    this.selectedSegmentUsers = [];
    this.syncSegmentForm();
  }

  private syncSegmentForm(): void {
    const ids = this.selectedSegmentUsers.map((u) => u._id);
    this.sendToSegmentForm.patchValue({ userIds: ids });
    this.sendToSegmentForm.get('userIds')?.markAsTouched();
    this.sendToSegmentForm.get('userIds')?.updateValueAndValidity();
    this.manualIdsControl.setValue(ids.join(', '), { emitEvent: false });
  }

  onManualIdsApply(): void {
    const raw = (this.manualIdsControl.value || '').trim();
    if (!raw) {
      this.selectedSegmentUsers = [];
      this.syncSegmentForm();
      return;
    }

    const ids = Array.from(
      new Set(
        raw
          .split(',')
          .map((id) => id.trim())
          .filter((id) => /^[a-f0-9]{24}$/i.test(id))
      )
    );

    const newUsers: UserOption[] = ids.map((id) => {
      const existing = this.selectedSegmentUsers.find((u) => u._id === id);
      if (existing) return existing;
      const fromSearch = this.segmentSearchResults.find((u) => u._id === id);
      if (fromSearch) return fromSearch;
      return {
        _id: id,
        fullName: `User ID: ${id.substring(0, 8)}...`,
        phone: 'Manual ID entry',
        userTypeLabel: 'Direct ID',
      };
    });

    this.selectedSegmentUsers = newUsers;
    this.syncSegmentForm();
  }

  // ── Template Presets ───────────────────────────────────────────────────
  applyPreset(preset: PresetTemplate): void {
    const currentForm = this.getActiveForm();
    currentForm.patchValue({
      title: preset.title,
      body: preset.body,
    });
    currentForm.markAsDirty();
  }

  // ── Form Helpers ───────────────────────────────────────────────────────
  getActiveForm(): FormGroup {
    if (this.selectedTab === 0) return this.broadcastForm;
    if (this.selectedTab === 1) return this.sendToUserForm;
    return this.sendToSegmentForm;
  }

  clearActiveForm(): void {
    const form = this.getActiveForm();
    form.reset({ deviceType: '' });
    if (this.selectedTab === 1) {
      this.onClearSelectedUser();
    } else if (this.selectedTab === 2) {
      this.onClearAllSegmentUsers();
    }
  }

  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  private cleanPayload(formValue: any) {
    const payload = { ...formValue };
    if (!payload.imageUrl || !payload.imageUrl.trim()) {
      delete payload.imageUrl;
    } else {
      payload.imageUrl = payload.imageUrl.trim();
    }
    if (!payload.deviceType) {
      delete payload.deviceType;
    }
    return payload;
  }

  // ── Dispatch Methods ───────────────────────────────────────────────────
  sendBroadcast(): void {
    if (this.broadcastForm.invalid) {
      this.broadcastForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.clearMessages();
    const payload = this.cleanPayload(this.broadcastForm.value);

    this.apiService.Postdata(URLConstant.pushNotificationBroadcast, payload, {}).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Broadcast notification dispatched successfully to all registered users!';
        this.broadcastForm.reset({ deviceType: '' });
        this.loadHistory();
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || err?.message || 'Failed to send broadcast notification.';
      },
    });
  }

  sendToUser(): void {
    if (this.sendToUserForm.invalid) {
      this.sendToUserForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.clearMessages();
    const payload = this.cleanPayload(this.sendToUserForm.value);

    this.apiService.Postdata(URLConstant.pushNotificationSendToUser, payload, {}).subscribe({
      next: (res: any) => {
        this.loading = false;
        const targetName = this.selectedUser ? this.selectedUser.fullName : payload.userId;
        const devices = res?.result?.devicesCount ?? res?.data?.devicesCount;
        const deviceInfo = devices !== undefined ? ` (${devices} active device${devices === 1 ? '' : 's'})` : '';
        this.successMessage = `Push notification sent successfully to ${targetName}${deviceInfo}!`;
        this.sendToUserForm.reset({ deviceType: '' });
        this.selectedUser = null;
        this.loadHistory();
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || err?.message || 'Failed to send notification to user.';
      },
    });
  }

  sendToSegment(): void {
    if (this.sendToSegmentForm.invalid) {
      this.sendToSegmentForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.clearMessages();
    const userIds: string[] = this.sendToSegmentForm.value.userIds || [];

    const payload = this.cleanPayload({
      userIds,
      title: this.sendToSegmentForm.value.title,
      body: this.sendToSegmentForm.value.body,
      imageUrl: this.sendToSegmentForm.value.imageUrl,
      deviceType: this.sendToSegmentForm.value.deviceType,
    });

    this.apiService.Postdata(URLConstant.pushNotificationSendToSegment, payload, {}).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = `Push notification sent successfully to ${userIds.length} selected users!`;
        this.sendToSegmentForm.reset({ deviceType: '' });
        this.selectedSegmentUsers = [];
        this.manualIdsControl.setValue('');
        this.loadHistory();
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || err?.message || 'Failed to send segment notification.';
      },
    });
  }

  // ── UI Display Utilities ───────────────────────────────────────────────
  getUserInitials(name?: string): string {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  getAvatarColor(name?: string): string {
    const colors = [
      '#6366f1',
      '#8b5cf6',
      '#ec4899',
      '#f43f5e',
      '#0ea5e9',
      '#10b981',
      '#f59e0b',
      '#45197c',
    ];
    if (!name) return colors[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  }

  getUserRoleClass(role?: string): string {
    switch ((role || '').toLowerCase()) {
      case 'doctor':
        return 'role-badge--doctor';
      case 'patient':
        return 'role-badge--patient';
      case 'hospital':
        return 'role-badge--hospital';
      case 'admin':
      case 'sub admin':
        return 'role-badge--admin';
      default:
        return 'role-badge--user';
    }
  }

  get currentTitle(): string {
    const form = this.getActiveForm();
    return form.get('title')?.value || 'Notification Title';
  }

  get currentBody(): string {
    const form = this.getActiveForm();
    return form.get('body')?.value || 'Your message preview will appear here in real-time as you compose it...';
  }

  get currentImageUrl(): string {
    const form = this.getActiveForm();
    return form.get('imageUrl')?.value || '';
  }

  get currentTargetSummary(): string {
    if (this.selectedTab === 0) {
      return 'All Registered Users';
    } else if (this.selectedTab === 1) {
      if (this.selectedUser) {
        return `${this.selectedUser.fullName} (${this.selectedUser.phone || this.selectedUser._id})`;
      }
      return 'Specific User (Select a user above)';
    } else {
      if (this.selectedSegmentUsers.length > 0) {
        return `${this.selectedSegmentUsers.length} Selected Users`;
      }
      return 'User Segment (Select recipients above)';
    }
  }
}

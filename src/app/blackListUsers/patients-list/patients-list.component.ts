import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

interface BlacklistItem {
  id: string;
  name: string;
  email: string;
  mobile: string;
  specialty: string;
  reason: string;
  date: string;      // ISO string
  removed?: boolean; // soft remove flag
}

@Component({
  selector: 'app-patients-list',
  templateUrl: './patients-list.component.html',
  styleUrls: ['./patients-list.component.scss']
})
export class PatientsListComponent implements OnInit {
  blacklist: BlacklistItem[] = [];
  storageKey = 'app_blacklist_v1';

  // modal/form state
  modalOpen = false;
  editing = false;
  editingId: string | null = null;
  form: { name: string; email: string; mobile: string; specialty: string; reason: string } = {
    name: '',
    email: '',
    mobile: '',
    specialty: '',
    reason: ''
  };

  // pagination
  page = 1;
  pageSize = 10;

  // show removed entries toggle
  showRemoved = false;

  constructor(private toastr: ToastrService) {}

  ngOnInit(): void {
    this.loadFromStorage();
  }

  // ---------- Persistence ----------
  loadFromStorage() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      this.blacklist = raw ? JSON.parse(raw) : [];
      // normalize date
      this.blacklist = this.blacklist.map(item => ({
        ...item,
        date: item.date ? new Date(item.date).toISOString() : new Date().toISOString()
      }));
    } catch (err) {
      console.error('Failed to load blacklist from storage', err);
      this.blacklist = [];
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.blacklist));
    } catch (err) {
      console.error('Failed to save blacklist', err);
      this.toastr.error('Failed to save blacklist to storage');
    }
  }

  // ---------- Helpers ----------
  generateId() {
    return 'b_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
  }

  filteredList(): BlacklistItem[] {
    return this.blacklist.filter(item => (this.showRemoved ? true : !item.removed));
  }

  filteredCount(): number {
    return this.filteredList().length;
  }

  visibleList(): BlacklistItem[] {
    const filtered = this.filteredList();
    const start = (this.page - 1) * this.pageSize;
    return filtered.slice(start, start + this.pageSize);
  }

  hasMore(): boolean {
    const filtered = this.filteredList();
    return this.page * this.pageSize < filtered.length;
  }

  prevPage() {
    if (this.page > 1) this.page--;
  }

  nextPage() {
    if (this.hasMore()) this.page++;
  }

  // ---------- Modal controls ----------
  openAddModal() {
    this.editing = false;
    this.editingId = null;
    this.form = { name: '', email: '', mobile: '', specialty: '', reason: '' };
    this.modalOpen = true;
    this.page = 1;
  }

  openEditModal(item: BlacklistItem) {
    this.editing = true;
    this.editingId = item.id;
    this.form = {
      name: item.name,
      email: item.email,
      mobile: item.mobile,
      specialty: item.specialty,
      reason: item.reason
    };
    this.modalOpen = true;
  }

  closeModal() {
    this.modalOpen = false;
    setTimeout(() => {
      this.editing = false;
      this.editingId = null;
    }, 200);
  }

  onBackdropClick(e: MouseEvent) {
    this.closeModal();
  }

  // ---------- Form submit ----------
  submitForm(formRef: any) {
    formRef.form.markAllAsTouched();

    // Basic required checks
    if (
      !this.form.name?.trim() ||
      !this.form.email?.trim() ||
      !this.form.mobile?.trim() ||
      !this.form.specialty?.trim() ||
      !this.form.reason?.trim()
    ) {
      this.toastr.error('Please fill all fields');
      return;
    }

    if (!this.validateEmail(this.form.email)) {
      this.toastr.error('Please enter a valid email');
      return;
    }

    if (!this.validateMobile(this.form.mobile)) {
      this.toastr.error('Please enter a valid mobile number (digits only, 7-15 chars)');
      return;
    }

    if (this.editing && this.editingId) {
      const idx = this.blacklist.findIndex(x => x.id === this.editingId);
      if (idx === -1) {
        this.toastr.error('Entry not found');
        this.closeModal();
        return;
      }

      // Check duplicates (email/mobile) against other entries
      const dup = this.blacklist.find(x => (x.email.toLowerCase() === this.form.email.trim().toLowerCase() || x.mobile === this.form.mobile.trim()) && x.id !== this.editingId);
      if (dup) {
        this.toastr.warning('Another entry with same email or mobile exists. Resolve duplicates before updating.');
        return;
      }

      this.blacklist[idx] = {
        ...this.blacklist[idx],
        name: this.form.name.trim(),
        email: this.form.email.trim(),
        mobile: this.form.mobile.trim(),
        specialty: this.form.specialty.trim(),
        reason: this.form.reason.trim()
      };
      this.saveToStorage();
      this.toastr.success('Blacklist entry updated');
    } else {
      // Prevent duplicate by email or mobile
      const exists = this.blacklist.find(
        x =>
          x.email.toLowerCase() === this.form.email.trim().toLowerCase() ||
          x.mobile === this.form.mobile.trim()
      );
      if (exists) {
        this.toastr.warning('This email or mobile is already blacklisted — opening the existing entry for edit.');
        this.openEditModal(exists);
        return;
      }

      const newItem: BlacklistItem = {
        id: this.generateId(),
        name: this.form.name.trim(),
        email: this.form.email.trim(),
        mobile: this.form.mobile.trim(),
        specialty: this.form.specialty.trim(),
        reason: this.form.reason.trim(),
        date: new Date().toISOString(),
        removed: false
      };
      this.blacklist.unshift(newItem);
      this.saveToStorage();
      this.toastr.success('User added to blacklist');
      this.page = 1;
    }

    this.closeModal();
  }

  // ---------- View / Remove / Delete ----------
  viewItem(item: BlacklistItem) {
    const txt =
      `Name: ${item.name}\nEmail: ${item.email}\nMobile: ${item.mobile}\nSpecialty: ${item.specialty}\nReason: ${item.reason}\nAdded: ${new Date(item.date).toLocaleString()}\nRemoved: ${item.removed ? 'Yes' : 'No'}`;
    alert(txt);
  }

  confirmRemove(item: BlacklistItem) {
    const confirmed = confirm('Remove this user from active blacklist (soft remove)?');
    if (!confirmed) return;
    const idx = this.blacklist.findIndex(x => x.id === item.id);
    if (idx === -1) {
      this.toastr.error('Entry not found');
      return;
    }
    this.blacklist[idx].removed = true;
    this.saveToStorage();
    this.toastr.warning('User removed from active blacklist (soft removed)');
  }

  confirmPermanentDelete(item: BlacklistItem) {
    const confirmed = confirm('Permanently delete this blacklist entry? This cannot be undone.');
    if (!confirmed) return;
    this.blacklist = this.blacklist.filter(x => x.id !== item.id);
    this.saveToStorage();
    this.toastr.success('Blacklist entry permanently deleted');
  }

  // ---------- Export CSV ----------
  exportCSV() {
    const rows = [['Name', 'Email', 'Mobile', 'Specialty', 'Reason', 'Date Added', 'Removed']];
    for (const it of this.blacklist) {
      rows.push([it.name, it.email, it.mobile, it.specialty, it.reason, new Date(it.date).toLocaleString(), it.removed ? 'Yes' : 'No']);
    }
    const csvContent = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'blacklist.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    this.toastr.success('CSV exported');
  }

  // ---------- Validation ----------
  validateEmail(email: string) {
    if (!email) return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  validateMobile(mobile: string) {
    if (!mobile) return false;
    const digits = mobile.replace(/\s+/g, '');
    const re = /^[0-9]{7,15}$/; // allow 7 to 15 digits
    return re.test(digits);
  }
}

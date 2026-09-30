import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthorService } from '../services/author.service';

@Component({
  selector: 'app-author-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './author-list.component.html',
  styleUrls: ['./author-list.component.scss']
})
export class AuthorListComponent implements OnInit {
  authors: any[] = [];
  filteredAuthors: any[] = [];
  isLoading = false;
  isSaving = false;
  isEditorOpen = false;
  editingAuthor: any | null = null;
  authorForm = this.emptyAuthor();
  isUploadingImage = false;
  imageUploadError = '';

  // Search & Filter
  searchQuery: string = '';
  sortBy: 'name' | 'blogs' | 'views' = 'blogs';

  constructor(private authorService: AuthorService) {}

  ngOnInit(): void {
    this.loadAuthors();
  }

  loadAuthors(): void {
    this.isLoading = true;
    this.authorService.getAuthors().subscribe({
      next: (response) => {
        this.authors = response.data || response.result || [];
        this.applyFilter();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Load authors error:', error);
        this.isLoading = false;
      }
    });
  }

  onSearchChange(): void {
    this.applyFilter();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.applyFilter();
  }

  setSort(type: 'name' | 'blogs' | 'views'): void {
    this.sortBy = type;
    this.applyFilter();
  }

  applyFilter(): void {
    let list = [...this.authors];

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toLowerCase();
      list = list.filter(a =>
        (a.name && a.name.toLowerCase().includes(q)) ||
        (a.email && a.email.toLowerCase().includes(q)) ||
        (a.qualification && a.qualification.toLowerCase().includes(q)) ||
        (a.specialization && a.specialization.toLowerCase().includes(q)) ||
        (a.bio && a.bio.toLowerCase().includes(q))
      );
    }

    if (this.sortBy === 'name') {
      list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (this.sortBy === 'blogs') {
      list.sort((a, b) => (b.blogCount || 0) - (a.blogCount || 0));
    } else if (this.sortBy === 'views') {
      list.sort((a, b) => (b.totalViews || 0) - (a.totalViews || 0));
    }

    this.filteredAuthors = list;
  }

  deleteAuthor(author: any): void {
    if (confirm(`Delete author "${author.name}"? Articles linked to this author will remain in the database.`)) {
      this.authorService.deleteAuthor(author._id).subscribe({
        next: () => {
          this.loadAuthors();
        },
        error: () => {
          alert('Failed to delete author');
        }
      });
    }
  }

  startCreate(): void {
    this.isEditorOpen = true;
    this.editingAuthor = null;
    this.imageUploadError = '';
    this.authorForm = this.emptyAuthor();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  startEdit(author: any): void {
    this.isEditorOpen = true;
    this.editingAuthor = author;
    this.imageUploadError = '';
    this.authorForm = {
      name: author.name,
      email: author.email || '',
      qualification: author.qualification || '',
      specialization: author.specialization || '',
      bio: author.bio || '',
      profileImage: author.profileImage || '',
      website: author.socialLinks?.website || '',
      linkedin: author.socialLinks?.linkedin || '',
      twitter: author.socialLinks?.twitter || ''
    };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  saveAuthor(): void {
    if (!this.authorForm.name.trim() || !this.isValidEmail(this.authorForm.email)) return;
    this.isSaving = true;
    const { website, linkedin, twitter, ...author } = this.authorForm;
    const payload = {
      ...author,
      socialLinks: {
        website: website ? website.trim() : '',
        linkedin: linkedin ? linkedin.trim() : '',
        twitter: twitter ? twitter.trim() : ''
      }
    };

    const request = this.editingAuthor
      ? this.authorService.updateAuthor(this.editingAuthor._id, payload)
      : this.authorService.createAuthor(payload);

    request.subscribe({
      next: () => {
        this.isSaving = false;
        this.isEditorOpen = false;
        this.editingAuthor = null;
        this.authorForm = this.emptyAuthor();
        this.loadAuthors();
      },
      error: (error) => {
        console.error('Save author error:', error);
        this.isSaving = false;
        alert('Failed to save author');
      }
    });
  }

  cancelEdit(): void {
    this.isEditorOpen = false;
    this.editingAuthor = null;
    this.imageUploadError = '';
    this.authorForm = this.emptyAuthor();
  }

  getTotalBlogCount(): number {
    return this.authors.reduce((total, author) => total + (author.blogCount || 0), 0);
  }

  getTotalViews(): number {
    return this.authors.reduce((total, author) => total + (author.totalViews || 0), 0);
  }

  formatNumber(num: number): string {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }

  getInitials(name: string): string {
    if (!name) return 'DR';
    const clean = name.replace(/^dr\.?\s+/i, '').trim();
    const parts = clean.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return (parts[0] ? parts[0].substring(0, 2) : 'DR').toUpperCase();
  }

  onImageError(event: any): void {
    event.target.style.display = 'none';
  }

  onImageSelect(event: any): void {
    const file = event.target.files?.[0];
    if (!file) return;

    this.imageUploadError = '';
    this.isUploadingImage = true;
    const reader = new FileReader();
    reader.onload = () => (this.authorForm.profileImage = String(reader.result || ''));
    reader.readAsDataURL(file);

    this.authorService.uploadProfileImage(file).subscribe({
      next: (response) => {
        const image = response?.data || response?.result || response;
        const url = image?.url || image?.profileImage || image?.image;
        if (url) {
          this.authorForm.profileImage = url;
        } else {
          this.imageUploadError = 'Image uploaded successfully.';
        }
        this.isUploadingImage = false;
      },
      error: (error) => {
        console.error('Author image upload error:', error);
        this.imageUploadError = error?.error?.message || 'Profile image upload failed.';
        this.isUploadingImage = false;
      }
    });
  }

  isValidEmail(email: string): boolean {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  trackByFn(index: number, item: any): any {
    return item._id || index;
  }

  private emptyAuthor(): any {
    return {
      name: '',
      email: '',
      qualification: '',
      specialization: '',
      bio: '',
      profileImage: '',
      website: '',
      linkedin: '',
      twitter: ''
    };
  }
}

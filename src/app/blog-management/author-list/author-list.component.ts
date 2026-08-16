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
  isLoading = false;
  isSaving = false;
  isEditorOpen = false;
  editingAuthor: any | null = null;
  authorForm = this.emptyAuthor();
  isUploadingImage = false;
  imageUploadError = '';

  constructor(private authorService: AuthorService) {}

  ngOnInit(): void {
    this.loadAuthors();
  }

  loadAuthors(): void {
    this.isLoading = true;
    this.authorService.getAuthors().subscribe(
      response => {
        this.authors = response.data || response.result || [];
        this.isLoading = false;
      },
      error => {
        console.error('Load authors error:', error);
        this.isLoading = false;
      }
    );
  }

  deleteAuthor(author: any): void {
    if (confirm(`Delete author "${author.name}"?`)) {
      this.authorService.deleteAuthor(author._id).subscribe(
        () => {
          alert('Author deleted');
          this.loadAuthors();
        },
        error => {
          alert('Failed to delete author');
        }
      );
    }
  }

  startCreate(): void {
    this.isEditorOpen = true;
    this.editingAuthor = null;
    this.imageUploadError = '';
    this.authorForm = this.emptyAuthor();
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
  }

  saveAuthor(): void {
    if (!this.authorForm.name.trim() || !this.isValidEmail(this.authorForm.email)) return;
    this.isSaving = true;
    const { website, linkedin, twitter, ...author } = this.authorForm;
    const payload = {
      ...author,
      socialLinks: { website: website || '', linkedin: linkedin || '', twitter: twitter || '' }
    };
    const request = this.editingAuthor ? this.authorService.updateAuthor(this.editingAuthor._id, payload) : this.authorService.createAuthor(payload);
    request.subscribe({
      next: () => { this.isSaving = false; this.isEditorOpen = false; this.editingAuthor = null; this.authorForm = this.emptyAuthor(); this.loadAuthors(); },
      error: (error) => { console.error('Save author error:', error); this.isSaving = false; alert('Failed to save author'); }
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
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  getInitials(name: string): string {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  onImageError(event: any): void {
    // Hide the broken image and show placeholder instead
    event.target.style.display = 'none';
    const placeholder = document.createElement('div');
    placeholder.className = 'author-avatar-placeholder';
    const authorName = event.target.alt.replace(' profile picture', '');
    placeholder.textContent = this.getInitials(authorName);
    placeholder.setAttribute('data-initials', this.getInitials(authorName));
    event.target.parentNode.appendChild(placeholder);
  }

  trackByFn(index: number, item: any): any {
    return item._id || index;
  }

  onImageSelect(event: any): void {
    const file = event.target.files?.[0];
    if (!file) return;

    this.imageUploadError = '';
    this.isUploadingImage = true;
    const reader = new FileReader();
    reader.onload = () => this.authorForm.profileImage = String(reader.result || '');
    reader.readAsDataURL(file);

    this.authorService.uploadProfileImage(file).subscribe({
      next: (response) => {
        const image = response?.data || response?.result || response;
        const url = image?.url;
        if (url) {
          this.authorForm.profileImage = url;
        } else {
          this.imageUploadError = 'The image was uploaded but no URL was returned.';
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
    return emailRegex.test(email);
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

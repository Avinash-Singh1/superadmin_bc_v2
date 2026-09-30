import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TagService } from '../services/tag.service';

@Component({
  selector: 'app-tag-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tag-list.component.html',
  styleUrls: ['./tag-list.component.scss']
})
export class TagListComponent implements OnInit {
  tags: any[] = [];
  filteredTags: any[] = [];
  isLoading = false;
  isSaving = false;
  isEditorOpen = false;
  editingTag: any | null = null;
  tagForm = this.emptyTag();

  // Search, Filter & View Controls
  searchQuery: string = '';
  sortBy: 'name' | 'blogs' = 'blogs';
  viewMode: 'grid' | 'cloud' = 'grid';

  // Curated Medical Color Presets
  colorPresets: string[] = [
    '#2563eb', // Royal Blue
    '#059669', // Emerald
    '#7c3aed', // Purple
    '#0284c7', // Sky Blue
    '#e11d48', // Rose
    '#d97706', // Amber
    '#0d9488', // Teal
    '#475569'  // Slate
  ];

  constructor(private tagService: TagService) {}

  ngOnInit(): void {
    this.loadTags();
  }

  loadTags(): void {
    this.isLoading = true;
    this.tagService.getTags().subscribe({
      next: (response) => {
        this.tags = response.data || response.result || [];
        this.applyFilter();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Load tags error:', error);
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

  setSort(type: 'name' | 'blogs'): void {
    this.sortBy = type;
    this.applyFilter();
  }

  setViewMode(mode: 'grid' | 'cloud'): void {
    this.viewMode = mode;
  }

  selectColor(color: string): void {
    this.tagForm.color = color;
  }

  applyFilter(): void {
    let list = [...this.tags];

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toLowerCase();
      list = list.filter(t =>
        (t.name && t.name.toLowerCase().includes(q)) ||
        (t.description && t.description.toLowerCase().includes(q))
      );
    }

    if (this.sortBy === 'name') {
      list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (this.sortBy === 'blogs') {
      list.sort((a, b) => (b.blogCount || 0) - (a.blogCount || 0));
    }

    this.filteredTags = list;
  }

  getTotalBlogCount(): number {
    return this.tags.reduce((total, tag) => total + (tag.blogCount || 0), 0);
  }

  getTopTag(): string {
    if (!this.tags.length) return '—';
    const sorted = [...this.tags].sort((a, b) => (b.blogCount || 0) - (a.blogCount || 0));
    return sorted[0]?.name || '—';
  }

  deleteTag(tag: any): void {
    if (confirm(`Delete tag "${tag.name}"? This will remove the tag association from related articles.`)) {
      this.tagService.deleteTag(tag._id).subscribe({
        next: () => {
          this.loadTags();
        },
        error: () => {
          alert('Failed to delete tag');
        }
      });
    }
  }

  startCreate(): void {
    this.isEditorOpen = true;
    this.editingTag = null;
    this.tagForm = this.emptyTag();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  startEdit(tag: any): void {
    this.isEditorOpen = true;
    this.editingTag = tag;
    this.tagForm = {
      name: tag.name,
      description: tag.description || '',
      color: tag.color || '#2563eb'
    };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  saveTag(): void {
    if (!this.tagForm.name.trim()) return;
    this.isSaving = true;
    const request = this.editingTag
      ? this.tagService.updateTag(this.editingTag._id, this.tagForm)
      : this.tagService.createTag(this.tagForm);

    request.subscribe({
      next: () => {
        this.isSaving = false;
        this.isEditorOpen = false;
        this.editingTag = null;
        this.tagForm = this.emptyTag();
        this.loadTags();
      },
      error: (error) => {
        console.error('Save tag error:', error);
        this.isSaving = false;
        alert('Failed to save tag');
      }
    });
  }

  cancelEdit(): void {
    this.isEditorOpen = false;
    this.editingTag = null;
    this.tagForm = this.emptyTag();
  }

  trackByFn(index: number, item: any): any {
    return item._id || index;
  }

  private emptyTag(): any {
    return { name: '', description: '', color: '#2563eb' };
  }
}

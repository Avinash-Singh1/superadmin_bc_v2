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
  isLoading = false;
  isSaving = false;
  isEditorOpen = false;
  editingTag: any | null = null;
  tagForm = this.emptyTag();

  constructor(private tagService: TagService) {}

  ngOnInit(): void {
    this.loadTags();
  }

  loadTags(): void {
    this.isLoading = true;
    this.tagService.getTags().subscribe(
      response => {
        this.tags = response.data || response.result || [];
        this.isLoading = false;
        // Add delay to ensure DOM is ready
        setTimeout(() => this.adjustTextColors(), 100);
      },
      error => {
        console.error('Load tags error:', error);
        this.isLoading = false;
      }
    );
  }

  adjustTextColors(): void {
    // Adjust text colors based on background brightness
    const tagChips = document.querySelectorAll('.tag-chip');
    tagChips.forEach((chip: any) => {
      const bgColor = window.getComputedStyle(chip).backgroundColor;
      if (this.isDarkColor(bgColor)) {
        chip.classList.add('dark-bg');
      } else {
        chip.classList.remove('dark-bg');
      }
    });
  }

  isDarkColor(rgb: string): boolean {
    // Extract RGB values
    const match = rgb.match(/\d+/g);
    if (!match || match.length < 3) return false;
    
    const r = parseInt(match[0]);
    const g = parseInt(match[1]);
    const b = parseInt(match[2]);
    
    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return true if color is dark (luminance < 0.5)
    return luminance < 0.5;
  }

  deleteTag(tag: any): void {
    if (confirm(`Delete tag "${tag.name}"?`)) {
      this.tagService.deleteTag(tag._id).subscribe(
        () => {
          alert('Tag deleted');
          this.loadTags();
        },
        error => {
          alert('Failed to delete tag');
        }
      );
    }
  }

  startCreate(): void { this.isEditorOpen = true; this.editingTag = null; this.tagForm = this.emptyTag(); }

  startEdit(tag: any): void {
    this.isEditorOpen = true;
    this.editingTag = tag;
    this.tagForm = { name: tag.name, description: tag.description || '', color: tag.color || '#5B3DF5' };
  }

  saveTag(): void {
    if (!this.tagForm.name.trim()) return;
    this.isSaving = true;
    const request = this.editingTag ? this.tagService.updateTag(this.editingTag._id, this.tagForm) : this.tagService.createTag(this.tagForm);
    request.subscribe({
      next: () => { this.isSaving = false; this.isEditorOpen = false; this.editingTag = null; this.tagForm = this.emptyTag(); this.loadTags(); },
      error: (error) => { console.error('Save tag error:', error); this.isSaving = false; alert('Failed to save tag'); }
    });
  }

  cancelEdit(): void { this.isEditorOpen = false; this.editingTag = null; this.tagForm = this.emptyTag(); }

  getTotalBlogCount(): number {
    return this.tags.reduce((total, tag) => total + (tag.blogCount || 0), 0);
  }

  trackByFn(index: number, item: any): any {
    return item._id || index;
  }

  private emptyTag(): any { return { name: '', description: '', color: '#5B3DF5' }; }
}

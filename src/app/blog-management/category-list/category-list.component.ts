import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../services/category.service';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss']
})
export class CategoryListComponent implements OnInit {
  categories: any[] = [];
  isLoading = false;
  isSaving = false;
  isEditorOpen = false;
  editingCategory: any | null = null;
  categoryForm = this.emptyCategory();

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading = true;
    this.categoryService.getCategories().subscribe(
      response => {
        this.categories = response.data || response.result || [];
        this.isLoading = false;
        // Add delay to ensure DOM is ready
        setTimeout(() => this.adjustTextColors(), 100);
      },
      error => {
        console.error('Load categories error:', error);
        this.isLoading = false;
      }
    );
  }

  adjustTextColors(): void {
    // Adjust text colors based on background brightness
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach((card: any) => {
      const bgColor = window.getComputedStyle(card).backgroundColor;
      if (this.isDarkColor(bgColor)) {
        card.classList.add('dark-bg');
      } else {
        card.classList.remove('dark-bg');
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

  deleteCategory(category: any): void {
    if (confirm(`Delete category "${category.name}"?`)) {
      this.categoryService.deleteCategory(category._id).subscribe(
        () => {
          alert('Category deleted');
          this.loadCategories();
        },
        error => {
          alert('Failed to delete category');
        }
      );
    }
  }

  startCreate(): void {
    this.isEditorOpen = true;
    this.editingCategory = null;
    this.categoryForm = this.emptyCategory();
  }

  startEdit(category: any): void {
    this.isEditorOpen = true;
    this.editingCategory = category;
    this.categoryForm = { name: category.name, description: category.description || '', color: category.color || '#5B3DF5', displayOrder: category.displayOrder || 0 };
  }

  saveCategory(): void {
    if (!this.categoryForm.name.trim()) return;
    this.isSaving = true;
    const request = this.editingCategory
      ? this.categoryService.updateCategory(this.editingCategory._id, this.categoryForm)
      : this.categoryService.createCategory(this.categoryForm);
    request.subscribe({
      next: () => { this.isSaving = false; this.isEditorOpen = false; this.editingCategory = null; this.categoryForm = this.emptyCategory(); this.loadCategories(); },
      error: (error) => { console.error('Save category error:', error); this.isSaving = false; alert('Failed to save category'); }
    });
  }

  cancelEdit(): void { this.isEditorOpen = false; this.editingCategory = null; this.categoryForm = this.emptyCategory(); }

  trackByFn(index: number, item: any): any {
    return item._id || index;
  }

  private emptyCategory(): any { return { name: '', description: '', color: '#5B3DF5', displayOrder: 0 }; }
}

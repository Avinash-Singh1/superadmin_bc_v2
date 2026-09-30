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
  filteredCategories: any[] = [];
  isLoading = false;
  isSaving = false;
  isEditorOpen = false;
  editingCategory: any | null = null;
  categoryForm = this.emptyCategory();

  // Search & Filters
  searchQuery: string = '';
  sortBy: 'order' | 'name' | 'blogs' = 'order';

  // Curated Medical Color Presets
  colorPresets: string[] = [
    '#2563eb', // Royal Blue (General Medicine)
    '#059669', // Emerald (Wellness & Nutrition)
    '#7c3aed', // Amethyst (Neurology / Mental Health)
    '#0284c7', // Sky Blue (Diagnostics & Imaging)
    '#e11d48', // Rose (Cardiology)
    '#d97706', // Amber (Pediatrics & Family Care)
    '#0d9488', // Teal (Dental & Surgery)
    '#475569'  // Slate (Clinical Guidelines)
  ];

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading = true;
    this.categoryService.getCategories().subscribe({
      next: (response) => {
        this.categories = response.data || response.result || [];
        this.applyFilter();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Load categories error:', error);
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

  setSort(type: 'order' | 'name' | 'blogs'): void {
    this.sortBy = type;
    this.applyFilter();
  }

  applyFilter(): void {
    let list = [...this.categories];

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toLowerCase();
      list = list.filter(c =>
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.description && c.description.toLowerCase().includes(q))
      );
    }

    if (this.sortBy === 'order') {
      list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    } else if (this.sortBy === 'name') {
      list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (this.sortBy === 'blogs') {
      list.sort((a, b) => (b.blogCount || 0) - (a.blogCount || 0));
    }

    this.filteredCategories = list;
  }

  selectColor(color: string): void {
    this.categoryForm.color = color;
  }

  getTotalBlogCount(): number {
    return this.categories.reduce((total, cat) => total + (cat.blogCount || 0), 0);
  }

  getTopCategory(): string {
    if (!this.categories.length) return '—';
    const sorted = [...this.categories].sort((a, b) => (b.blogCount || 0) - (a.blogCount || 0));
    return sorted[0]?.name || '—';
  }

  deleteCategory(category: any): void {
    if (confirm(`Delete category "${category.name}"? Articles assigned to this category may need re-assignment.`)) {
      this.categoryService.deleteCategory(category._id).subscribe({
        next: () => {
          this.loadCategories();
        },
        error: () => {
          alert('Failed to delete category');
        }
      });
    }
  }

  startCreate(): void {
    this.isEditorOpen = true;
    this.editingCategory = null;
    this.categoryForm = this.emptyCategory();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  startEdit(category: any): void {
    this.isEditorOpen = true;
    this.editingCategory = category;
    this.categoryForm = {
      name: category.name,
      description: category.description || '',
      color: category.color || '#2563eb',
      displayOrder: category.displayOrder !== undefined ? category.displayOrder : 0
    };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  saveCategory(): void {
    if (!this.categoryForm.name.trim()) return;
    this.isSaving = true;
    const request = this.editingCategory
      ? this.categoryService.updateCategory(this.editingCategory._id, this.categoryForm)
      : this.categoryService.createCategory(this.categoryForm);

    request.subscribe({
      next: () => {
        this.isSaving = false;
        this.isEditorOpen = false;
        this.editingCategory = null;
        this.categoryForm = this.emptyCategory();
        this.loadCategories();
      },
      error: (error) => {
        console.error('Save category error:', error);
        this.isSaving = false;
        alert('Failed to save category');
      }
    });
  }

  cancelEdit(): void {
    this.isEditorOpen = false;
    this.editingCategory = null;
    this.categoryForm = this.emptyCategory();
  }

  trackByFn(index: number, item: any): any {
    return item._id || index;
  }

  private emptyCategory(): any {
    return { name: '', description: '', color: '#2563eb', displayOrder: 0 };
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BlogListResponse, BlogService } from '../services/blog.service';
import { CategoryService } from '../services/category.service';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe, DatePipe],
  templateUrl: './blog-list.component.html',
  styleUrls: ['./blog-list.component.scss']
})
export class BlogListComponent implements OnInit {
  blogs: any[] = [];
  categories: any[] = [];
  isLoading = false;
  error: string = '';

  // Pagination
  currentPage = 1;
  pageSize = 20;
  totalBlogs = 0;
  totalPages = 0;

  // Filters
  searchQuery = '';
  statusFilter = '';
  categoryFilter = '';
  sortBy = '-createdAt';

  // Selection
  selectedBlogs: any[] = [];
  selectAll = false;

  constructor(
    private blogService: BlogService,
    private categoryService: CategoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadBlogs();
    this.loadCategories();
  }

  loadBlogs(): void {
    this.isLoading = true;
    this.error = '';

    const params: any = {
      page: this.currentPage,
      limit: this.pageSize,
      sort: this.sortBy
    };

    if (this.searchQuery) {
      params.search = this.searchQuery;
    }

    if (this.statusFilter) {
      params.status = this.statusFilter;
    }

    if (this.categoryFilter) {
      params.category = this.categoryFilter;
    }

    this.blogService.getBlogs(params).subscribe(
      response => {
        const rawResponse = response as BlogListResponse & { result?: BlogListResponse['data'] };
        const data = rawResponse.data || rawResponse.result || { blogs: [], pagination: {} };
        this.blogs = data.blogs || [];
        this.totalBlogs = data.pagination?.total || 0;
        this.totalPages = data.pagination?.pages || 0;
        this.currentPage = data.pagination?.page || 1;
        this.isLoading = false;
        // Add delay to ensure DOM is ready
        setTimeout(() => this.adjustCategoryBadgeColors(), 100);
      },
      error => {
        this.error = 'Failed to load blogs';
        this.isLoading = false;
        console.error('Load blogs error:', error);
      }
    );
  }

  adjustCategoryBadgeColors(): void {
    // Adjust text colors for category badges based on background brightness
    const badges = document.querySelectorAll('.category-badge');
    badges.forEach((badge: any) => {
      const bgColor = window.getComputedStyle(badge).backgroundColor;
      if (this.isDarkColor(bgColor)) {
        badge.classList.add('dark-bg');
      } else {
        badge.classList.remove('dark-bg');
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
    
    // Calculate relative luminance (WCAG formula)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return true if color is dark (luminance < 0.5)
    return luminance < 0.5;
  }

  loadCategories(): void {
    this.categoryService.getCategories(true).subscribe(
      response => {
        this.categories = response.data || response.result || [];
      },
      error => {
        console.error('Load categories error:', error);
      }
    );
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadBlogs();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadBlogs();
  }

  onSortChange(): void {
    this.currentPage = 1;
    this.loadBlogs();
  }

  createBlog(): void {
    this.router.navigate(['/theme/blog-management/blogs/create']);
  }

  editBlog(blog: any): void {
    this.router.navigate(['/theme/blog-management/blogs/edit', blog._id]);
  }

  viewBlog(blog: any): void {
    // Open blog in new tab (patient view)
    window.open(`/blogs/${blog.slug}`, '_blank');
  }

  deleteBlog(blog: any): void {
    if (confirm(`Are you sure you want to delete "${blog.title}"?`)) {
      this.blogService.deleteBlog(blog._id).subscribe(
        () => {
          alert('Blog deleted successfully');
          this.loadBlogs();
        },
        error => {
          alert('Failed to delete blog');
          console.error('Delete error:', error);
        }
      );
    }
  }

  publishBlog(blog: any): void {
    this.blogService.publishBlog(blog._id).subscribe(
      () => {
        alert('Blog published successfully');
        this.loadBlogs();
      },
      error => {
        alert('Failed to publish blog');
        console.error('Publish error:', error);
      }
    );
  }

  archiveBlog(blog: any): void {
    if (confirm(`Are you sure you want to archive "${blog.title}"?`)) {
      this.blogService.archiveBlog(blog._id).subscribe(
        () => {
          alert('Blog archived successfully');
          this.loadBlogs();
        },
        error => {
          alert('Failed to archive blog');
          console.error('Archive error:', error);
        }
      );
    }
  }

  toggleSelectAll(): void {
    this.selectAll = !this.selectAll;
    if (this.selectAll) {
      this.selectedBlogs = [...this.blogs];
    } else {
      this.selectedBlogs = [];
    }
  }

  toggleSelectBlog(blog: any): void {
    const index = this.selectedBlogs.findIndex(b => b._id === blog._id);
    if (index > -1) {
      this.selectedBlogs.splice(index, 1);
    } else {
      this.selectedBlogs.push(blog);
    }
    this.selectAll = this.selectedBlogs.length === this.blogs.length;
  }

  isSelected(blog: any): boolean {
    return this.selectedBlogs.some(b => b._id === blog._id);
  }

  bulkPublish(): void {
    if (this.selectedBlogs.length === 0) {
      alert('Please select blogs first');
      return;
    }

    if (confirm(`Publish ${this.selectedBlogs.length} blog(s)?`)) {
      const ids = this.selectedBlogs.map(b => b._id);
      this.blogService.bulkUpdate(ids, { status: 'published' }).subscribe(
        () => {
          alert('Blogs published successfully');
          this.selectedBlogs = [];
          this.selectAll = false;
          this.loadBlogs();
        },
        error => {
          alert('Failed to publish blogs');
          console.error('Bulk publish error:', error);
        }
      );
    }
  }

  bulkArchive(): void {
    if (this.selectedBlogs.length === 0) {
      alert('Please select blogs first');
      return;
    }

    if (confirm(`Archive ${this.selectedBlogs.length} blog(s)?`)) {
      const ids = this.selectedBlogs.map(b => b._id);
      this.blogService.bulkUpdate(ids, { status: 'archived' }).subscribe(
        () => {
          alert('Blogs archived successfully');
          this.selectedBlogs = [];
          this.selectAll = false;
          this.loadBlogs();
        },
        error => {
          alert('Failed to archive blogs');
          console.error('Bulk archive error:', error);
        }
      );
    }
  }

  bulkDelete(): void {
    if (this.selectedBlogs.length === 0) {
      alert('Please select blogs first');
      return;
    }

    if (confirm(`Delete ${this.selectedBlogs.length} blog(s)? This action cannot be undone.`)) {
      const deletePromises = this.selectedBlogs.map(b => 
        this.blogService.deleteBlog(b._id).toPromise()
      );

      Promise.all(deletePromises)
        .then(() => {
          alert('Blogs deleted successfully');
          this.selectedBlogs = [];
          this.selectAll = false;
          this.loadBlogs();
        })
        .catch(error => {
          alert('Failed to delete some blogs');
          console.error('Bulk delete error:', error);
        });
    }
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadBlogs();
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  getStatusIcon(status: string): string {
    const icons: any = {
      'published': 'check_circle',
      'draft': 'edit',
      'scheduled': 'schedule',
      'archived': 'archive'
    };
    return icons[status] || 'article';
  }

  trackByFn(index: number, item: any): any {
    return item._id || index;
  }
}

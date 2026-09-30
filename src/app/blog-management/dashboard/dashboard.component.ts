import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BlogService } from '../services/blog.service';
import { CategoryService } from '../services/category.service';
import { AuthorService } from '../services/author.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DecimalPipe, DatePipe, FormsModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  Math = Math;
  analytics: any = null;
  isLoading = true;
  error: string = '';

  // KPI Metrics
  stats: any[] = [];
  recentBlogs: any[] = [];
  filteredBlogs: any[] = [];
  searchQuery: string = '';
  activeStatusFilter: string = 'all';

  // Additional counts
  totalCategoriesCount = 0;
  totalAuthorsCount = 0;

  constructor(
    private blogService: BlogService,
    private categoryService: CategoryService,
    private authorService: AuthorService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.error = '';

    this.blogService.getDashboardAnalytics().subscribe({
      next: (response) => {
        this.analytics = response.data || response.result || {};
        this.prepareStats();
        this.isLoading = false;
        this.applyBlogFilter();
      },
      error: (err) => {
        this.error = 'Failed to load dashboard data. Please verify network connectivity.';
        this.isLoading = false;
        console.error('Dashboard error:', err);
      }
    });

    // Load category & author counts for rich overview
    this.categoryService.getCategories().subscribe({
      next: (res) => {
        const cats = res.data || res.result || [];
        this.totalCategoriesCount = cats.length;
      },
      error: () => {}
    });

    this.authorService.getAuthors().subscribe({
      next: (res) => {
        const authors = res.data || res.result || [];
        this.totalAuthorsCount = authors.length;
      },
      error: () => {}
    });
  }

  prepareStats(): void {
    if (!this.analytics) return;

    const total = this.analytics.totalBlogs || 0;
    const published = this.analytics.publishedBlogs || 0;
    const drafts = this.analytics.draftBlogs || 0;
    const scheduled = this.analytics.scheduledBlogs || 0;
    const totalViews = this.analytics.totalViews || 0;
    const publishedRate = total > 0 ? Math.round((published / total) * 100) : 0;

    this.stats = [
      {
        id: 'total',
        title: 'Total Articles',
        value: total,
        subtitle: `${publishedRate}% published rate`,
        icon: 'article',
        color: '#2563eb',
        bg: '#eff6ff',
        trend: '+12% this month'
      },
      {
        id: 'published',
        title: 'Published',
        value: published,
        subtitle: 'Live in patient portal',
        icon: 'check_circle',
        color: '#059669',
        bg: '#ecfdf5',
        trend: 'Live'
      },
      {
        id: 'drafts',
        title: 'Drafts in Progress',
        value: drafts,
        subtitle: 'Awaiting clinical review',
        icon: 'edit_note',
        color: '#d97706',
        bg: '#fffbeb',
        trend: 'In Review'
      },
      {
        id: 'scheduled',
        title: 'Scheduled',
        value: scheduled,
        subtitle: 'Queued for auto-release',
        icon: 'schedule',
        color: '#7c3aed',
        bg: '#f5f3ff',
        trend: 'Upcoming'
      },
      {
        id: 'views',
        title: 'Total Impressions',
        value: totalViews,
        subtitle: total > 0 ? `~${Math.round(totalViews / Math.max(published, 1))} avg per post` : '0 avg views',
        icon: 'visibility',
        color: '#0284c7',
        bg: '#f0f9ff',
        trend: 'Audience Reach'
      },
      {
        id: 'reading',
        title: 'Avg. Reading Time',
        value: (this.analytics.avgReadingTime || 4) + ' min',
        subtitle: 'Patient engagement depth',
        icon: 'timer',
        color: '#0d9488',
        bg: '#f0fdfa',
        trend: 'Optimal'
      }
    ];

    this.recentBlogs = this.analytics.mostViewedBlogs || [];
    this.filteredBlogs = [...this.recentBlogs];
  }

  setFilter(status: string): void {
    this.activeStatusFilter = status;
    this.applyBlogFilter();
  }

  onSearchChange(): void {
    this.applyBlogFilter();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.applyBlogFilter();
  }

  getViewBarWidth(views: number): number {
    const v = views || 0;
    return Math.min(Math.round((v / 1000) * 100), 100);
  }

  applyBlogFilter(): void {
    if (!this.recentBlogs) {
      this.filteredBlogs = [];
      return;
    }

    let list = [...this.recentBlogs];

    if (this.activeStatusFilter !== 'all') {
      list = list.filter(b => (b.status || 'published').toLowerCase() === this.activeStatusFilter.toLowerCase());
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toLowerCase();
      list = list.filter(b =>
        (b.title && b.title.toLowerCase().includes(q)) ||
        (b.author?.name && b.author.name.toLowerCase().includes(q)) ||
        (b.category?.name && b.category.name.toLowerCase().includes(q))
      );
    }

    this.filteredBlogs = list;
  }

  getPublishedPercent(): number {
    if (!this.analytics?.totalBlogs) return 0;
    return Math.round(((this.analytics.publishedBlogs || 0) / this.analytics.totalBlogs) * 100);
  }

  getDraftPercent(): number {
    if (!this.analytics?.totalBlogs) return 0;
    return Math.round(((this.analytics.draftBlogs || 0) / this.analytics.totalBlogs) * 100);
  }

  getScheduledPercent(): number {
    if (!this.analytics?.totalBlogs) return 0;
    return Math.round(((this.analytics.scheduledBlogs || 0) / this.analytics.totalBlogs) * 100);
  }

  formatNumber(num: number): string {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }

  refresh(): void {
    this.loadDashboardData();
  }

  trackByFn(index: number, item: any): any {
    return item._id || index;
  }
}

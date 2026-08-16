import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { BlogService } from '../services/blog.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DecimalPipe, DatePipe],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  analytics: any = null;
  isLoading = true;
  error: string = '';

  stats: any[] = [];
  recentBlogs: any[] = [];

  constructor(private blogService: BlogService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.blogService.getDashboardAnalytics().subscribe(
      response => {
        this.analytics = response.data || response.result || {};
        this.prepareStats();
        this.isLoading = false;
        // Add delay to ensure DOM is ready for color detection
        setTimeout(() => this.adjustColorContrast(), 100);
      },
      error => {
        this.error = 'Failed to load dashboard data';
        this.isLoading = false;
        console.error('Dashboard error:', error);
      }
    );
  }

  adjustColorContrast(): void {
    // Adjust text colors for category badges and tag chips based on background brightness
    const elements = document.querySelectorAll('.category-badge, .tag-chip');
    elements.forEach((element: any) => {
      const bgColor = window.getComputedStyle(element).backgroundColor;
      if (this.isDarkColor(bgColor)) {
        element.classList.add('dark-bg');
        // Also store the background color as a CSS variable for inline styled elements
        element.style.setProperty('--chip-bg-color', bgColor);
      } else {
        element.classList.remove('dark-bg');
        // For light backgrounds with inline styles, preserve the color
        if (element.style.backgroundColor) {
          element.style.setProperty('--chip-bg-color', element.style.backgroundColor);
        }
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
    
    // Calculate relative luminance using WCAG formula
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return true if color is dark (luminance < 0.5)
    return luminance < 0.5;
  }

  prepareStats(): void {
    if (!this.analytics) return;

    this.stats = [
      {
        title: 'Total Blogs',
        value: this.analytics.totalBlogs || 0,
        icon: 'article',
        color: '#4CAF50'
      },
      {
        title: 'Published',
        value: this.analytics.publishedBlogs || 0,
        icon: 'check_circle',
        color: '#2196F3'
      },
      {
        title: 'Drafts',
        value: this.analytics.draftBlogs || 0,
        icon: 'edit',
        color: '#FF9800'
      },
      {
        title: 'Scheduled',
        value: this.analytics.scheduledBlogs || 0,
        icon: 'schedule',
        color: '#9C27B0'
      },
      {
        title: 'Total Views',
        value: this.analytics.totalViews || 0,
        icon: 'visibility',
        color: '#F44336'
      },
      {
        title: 'Featured',
        value: this.analytics.featuredBlogs || 0,
        icon: 'star',
        color: '#FFC107'
      }
    ];

    this.recentBlogs = this.analytics.mostViewedBlogs || [];
  }

  refresh(): void {
    this.loadDashboardData();
  }

  trackByFn(index: number, item: any): any {
    return item._id || index;
  }
}

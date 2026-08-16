import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Blog {
  _id?: string;
  title: string;
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  featuredImage: string;
  thumbnail?: string;
  bannerImage?: string;
  ogImage?: string;
  author: string;
  category: string;
  tags?: string[];
  summary: string;
  content: string;
  faqs?: Array<{ question: string; answer: string }>;
  ctaSection?: {
    title?: string;
    description?: string;
    buttonText?: string;
    buttonLink?: string;
  };
  keywords?: string[];
  schemaType?: string;
  publishDate?: Date;
  scheduleDate?: Date;
  status?: string;
  isFeatured?: boolean;
  isTrending?: boolean;
  readingTime?: number;
  views?: number;
  likes?: number;
}

export interface BlogListResponse {
  success: boolean;
  result?: BlogListResponse['data'];
  data: {
    blogs: Blog[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

export interface DashboardAnalytics {
  totalBlogs: number;
  publishedBlogs: number;
  draftBlogs: number;
  scheduledBlogs: number;
  archivedBlogs: number;
  featuredBlogs: number;
  totalViews: number;
  avgReadingTime: number;
  topCategories: any[];
  topTags: any[];
  mostViewedBlogs: any[];
}

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private apiUrl = `${environment.API_BASE_URL}v1/blogs`;

  constructor(private http: HttpClient) {}

  // Dashboard Analytics
  getDashboardAnalytics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard/analytics`);
  }

  // CRUD Operations
  getBlogs(params: any = {}): Observable<BlogListResponse> {
    let httpParams = new HttpParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        httpParams = httpParams.set(key, params[key].toString());
      }
    });

    return this.http.get<BlogListResponse>(this.apiUrl, { params: httpParams });
  }

  getBlogById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createBlog(blog: Blog): Observable<any> {
    return this.http.post(this.apiUrl, blog);
  }

  updateBlog(id: string, blog: Partial<Blog>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, blog);
  }

  deleteBlog(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Status Operations
  publishBlog(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/publish`, {});
  }

  archiveBlog(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/archive`, {});
  }

  // Bulk Operations
  bulkUpdate(blogIds: string[], updates: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/bulk-update`, { blogIds, updates });
  }

  // Image Upload
  uploadImage(file: File, type: string = 'featured'): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', type);

    return this.http.post(`${this.apiUrl}/upload/image`, formData);
  }

  uploadMultipleImages(files: File[]): Observable<any> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    return this.http.post(`${this.apiUrl}/upload/images`, formData);
  }

  // Search
  searchBlogs(query: string, filters: any = {}): Observable<any> {
    let params = new HttpParams().set('q', query);
    
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params = params.set(key, filters[key]);
      }
    });

    return this.http.get(`${this.apiUrl}/public`, { params });
  }
}

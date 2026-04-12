import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface SitemapMeta {
  categories: string[];
  urlCounts: Record<string, number>;
  totalUrls: number;
  lastGenerated: string;
  domain: string;
}

@Injectable({ providedIn: 'root' })
export class SitemapService {
  private syncUrl = `${environment.BASE_URL}sync-sitemap`;
  private metaUrl = `${environment.API_BASE_URL}v1/common/sitemap-meta`;

  constructor(private http: HttpClient) {}

  private getHeaders(token: string): HttpHeaders {
    return new HttpHeaders()
      .set('x-admin-token', environment.ADMIN_SECRET_KEY)
      .set('Authorization', `Bearer ${token}`)
      .set('x-api-key', environment.X_API_KEY);
  }

  syncSitemap(token: string): Observable<{ success: boolean; message?: string; error?: string }> {
    return this.http.get<{ success: boolean; message?: string; error?: string }>(
      this.syncUrl,
      { headers: this.getHeaders(token) }
    );
  }

  getSitemapMeta(token: string): Observable<{ result: SitemapMeta }> {
    return this.http.get<{ result: SitemapMeta }>(
      this.metaUrl,
      { headers: this.getHeaders(token) }
    );
  }
}

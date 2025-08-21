// sitemap.service.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class SitemapService {
  // ✅ Uses BASE_URL from env so it works in dev & prod
  private syncUrl = `${environment.BASE_URL}sync-sitemap`;

  constructor(private http: HttpClient) {}

  syncSitemap(token: string): Observable<{ success: boolean; message?: string; error?: string }> {
    const headers = new HttpHeaders()
      .set('x-admin-token', environment.ADMIN_SECRET_KEY)  // ✅ backend check
      .set('Authorization', `Bearer ${token}`)            // ✅ secure auth
      .set('x-api-key', environment.X_API_KEY);           // ✅ API key from env

    return this.http.get<{ success: boolean; message?: string; error?: string }>(
      this.syncUrl,
      { headers }
    );
  }
}

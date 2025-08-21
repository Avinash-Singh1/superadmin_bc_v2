import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment'; // make sure you have env setup

@Injectable({ providedIn: 'root' })
export class SitemapService {
  // Use environment variable so it switches automatically between dev/prod
  // private syncUrl = `https://nectarplus.health/sync-sitemap`;
  private syncUrl = `${environment.BASE_URL}sync-sitemap`;

  constructor(private http: HttpClient) {}

  syncSitemap(token: string): Observable<{ success: boolean; message?: string; error?: string }> {
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`) // ✅ secure auth
      .set('x-api-key', environment.X_API_KEY); // ✅ API key from env

    return this.http.get<{ success: boolean; message?: string; error?: string }>(
      this.syncUrl,
      { headers }
    );
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError, shareReplay, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Specialization {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  [key: string]: any;
}

/**
 * Centralized Specialization Service
 * Eliminates hardcoded specialization arrays across admin panel
 * Provides single source of truth for all specialization data
 * Automatically syncs when backend specializations are updated
 */
@Injectable({
  providedIn: 'root'
})
export class SpecializationService {
  private apiUrl = `${environment.API_BASE_URL}v1/master/specialization`;
  
  // BehaviorSubject to track specializations and allow manual refresh
  private specializations$ = new BehaviorSubject<Specialization[]>([]);
  public specializations = this.specializations$.asObservable();

  // In-flight request tracking to prevent duplicate API calls
  private inFlightRequest$: Observable<Specialization[]> | null = null;

  constructor(private http: HttpClient) {
    // Auto-load specializations on service initialization
    this.loadSpecializations();
  }

  /**
   * Get all specializations
   * Returns cached observable if available, otherwise fetches from API
   * Uses shareReplay to cache the result across all subscribers
   */
  getAll(): Observable<Specialization[]> {
    // If request is already in flight, return it (avoid duplicate requests)
    if (this.inFlightRequest$) {
      return this.inFlightRequest$;
    }

    // Create new request if not already loaded
    if (this.specializations$.value.length === 0) {
      this.inFlightRequest$ = this.fetchFromAPI().pipe(
        tap(() => {
          this.inFlightRequest$ = null; // Clear in-flight tracker
        }),
        shareReplay(1)
      );
      return this.inFlightRequest$;
    }

    // Return cached specializations
    return this.specializations;
  }

  /**
   * Fetch specializations from backend API
   * @param limit Optional limit for pagination (default: 1000)
   * @returns Observable of specializations array
   */
  private fetchFromAPI(limit: number = 1000): Observable<Specialization[]> {
    return this.http.get<any>(this.apiUrl, {
      params: { limit: limit.toString() }
    }).pipe(
      map(res => {
        // Handle different response structures
        const data = res?.result?.data || res?.data || [];
        return Array.isArray(data) ? data : [];
      }),
      tap(specializations => {
        // Update BehaviorSubject with fetched data
        this.specializations$.next(specializations);
      }),
      catchError(err => {
        console.error('Failed to load specializations from API', {
          url: this.apiUrl,
          error: err?.error?.message || err?.message || 'Unknown error',
          status: err?.status
        });
        // Return empty array on error to keep UI functional
        return of([]);
      })
    );
  }

  /**
   * Manually load/refresh specializations
   * Call this on component init or when specializations change
   */
  loadSpecializations(): void {
    this.inFlightRequest$ = this.fetchFromAPI().pipe(
      tap(() => {
        this.inFlightRequest$ = null;
      }),
      shareReplay(1)
    );
  }

  /**
   * Manually refresh specializations (bypasses cache)
   * Call this after creating/updating/deleting specializations
   */
  refresh(): Observable<Specialization[]> {
    this.inFlightRequest$ = null; // Clear in-flight tracker to force fresh fetch
    return this.getAll();
  }

  /**
   * Get specialization by ID
   * @param id MongoDB ObjectId of specialization
   * @returns Specialization object or undefined
   */
  getById(id: string): Observable<Specialization | undefined> {
    return this.specializations.pipe(
      map(specs => specs.find(s => s._id === id))
    );
  }

  /**
   * Get specialization by slug
   * @param slug URL slug of specialization
   * @returns Specialization object or undefined
   */
  getBySlug(slug: string): Observable<Specialization | undefined> {
    return this.specializations.pipe(
      map(specs => specs.find(s => s.slug === slug || s.name?.toLowerCase().replace(/\s+/g, '-') === slug))
    );
  }

  /**
   * Search specializations by name
   * @param query Search query string
   * @returns Observable of matching specializations
   */
  search(query: string): Observable<Specialization[]> {
    const lowerQuery = query.toLowerCase();
    return this.specializations.pipe(
      map(specs => specs.filter(s => 
        s.name?.toLowerCase().includes(lowerQuery) ||
        s.slug?.toLowerCase().includes(lowerQuery) ||
        s.description?.toLowerCase().includes(lowerQuery)
      ))
    );
  }

  /**
   * Clear cache (use sparingly)
   * Forces next getAll() call to fetch from API
   */
  clearCache(): void {
    this.specializations$.next([]);
    this.inFlightRequest$ = null;
  }
}

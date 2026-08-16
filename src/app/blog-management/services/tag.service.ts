import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Tag {
  _id?: string;
  name: string;
  slug?: string;
  description?: string;
  color?: string;
  isActive?: boolean;
  blogCount?: number;
}

@Injectable({
  providedIn: 'root'
})
export class TagService {
  private apiUrl = `${environment.API_BASE_URL}v1/blogs/tags`;

  constructor(private http: HttpClient) {}

  getTags(isActive?: boolean): Observable<any> {
    const url = isActive !== undefined 
      ? `${this.apiUrl}?isActive=${isActive}` 
      : this.apiUrl;
    return this.http.get(url);
  }

  getTagById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createTag(tag: Tag): Observable<any> {
    return this.http.post(this.apiUrl, tag);
  }

  updateTag(id: string, tag: Partial<Tag>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, tag);
  }

  deleteTag(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getPopularTags(limit: number = 20): Observable<any> {
    return this.http.get(`${this.apiUrl}?popular=true&limit=${limit}`);
  }
}

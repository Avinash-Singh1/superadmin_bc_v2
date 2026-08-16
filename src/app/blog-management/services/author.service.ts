import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Author {
  _id?: string;
  name: string;
  slug?: string;
  email?: string;
  profileImage?: string;
  bio?: string;
  qualification?: string;
  specialization?: string;
  experience?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
    website?: string;
  };
  isActive?: boolean;
  blogCount?: number;
  totalViews?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthorService {
  private apiUrl = `${environment.API_BASE_URL}v1/blogs/authors`;

  constructor(private http: HttpClient) {}

  getAuthors(isActive?: boolean): Observable<any> {
    const url = isActive !== undefined 
      ? `${this.apiUrl}?isActive=${isActive}` 
      : this.apiUrl;
    return this.http.get(url);
  }

  getAuthorById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createAuthor(author: Author): Observable<any> {
    return this.http.post(this.apiUrl, author);
  }

  updateAuthor(id: string, author: Partial<Author>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, author);
  }

  deleteAuthor(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  uploadProfileImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);

    return this.http.post(
      `${environment.API_BASE_URL}v1/blogs/upload/author-image`, 
      formData
    );
  }
}

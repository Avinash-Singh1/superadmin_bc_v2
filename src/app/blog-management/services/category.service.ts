import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Category {
  _id?: string;
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  color?: string;
  parentCategory?: string;
  displayOrder?: number;
  isActive?: boolean;
  blogCount?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = `${environment.API_BASE_URL}v1/blogs/categories`;

  constructor(private http: HttpClient) {}

  getCategories(isActive?: boolean): Observable<any> {
    const url = isActive !== undefined 
      ? `${this.apiUrl}?isActive=${isActive}` 
      : this.apiUrl;
    return this.http.get(url);
  }

  getCategoryById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createCategory(category: Category): Observable<any> {
    return this.http.post(this.apiUrl, category);
  }

  updateCategory(id: string, category: Partial<Category>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, category);
  }

  deleteCategory(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}

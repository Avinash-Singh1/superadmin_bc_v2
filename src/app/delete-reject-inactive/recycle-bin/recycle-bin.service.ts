import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/shared/api.service';
import { URLConstant } from 'src/app/apisURL/url';
import { environment } from 'src/environments/environment';

export type RecycleBinTypeFilter = 'all' | 'patient' | 'doctor' | 'hospital' | 'establishment';
export type RecycleBinStatusFilter = 'all' | 'deleted' | 'rejected' | 'inactive';

export interface RecycleBinFilters {
  type: RecycleBinTypeFilter;
  status: RecycleBinStatusFilter;
  search: string;
  sort: 'createdAt' | 'name' | 'status' | 'type';
  sortOrder: 'ASC' | 'DESC';
  page: number;
  size: number;
}

export interface RecycleBinRow {
  _id: string;
  userType: number;
  userTypeLabel: 'patient' | 'doctor' | 'hospital' | 'establishment';
  status: number;
  isDeleted: boolean;
  isVerified: number | null;
  derivedStatus: 'deleted' | 'rejected' | 'inactive' | 'unknown';
  displayName: string;
  profileImage: string | null;
  phone: string;
  email: string | null;
  gender: number | null;
  dob: string | null;
  specialty: string | null;
  cityName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RecycleBinResponse {
  data: RecycleBinRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

@Injectable({ providedIn: 'root' })
export class RecycleBinService {
  constructor(private apiService: ApiService, private http: HttpClient) {}

  list(filters: RecycleBinFilters): Observable<any> {
    return this.apiService.GetData(URLConstant.recycleBinList, filters as any);
  }

  permanentDelete(row: Pick<RecycleBinRow, '_id' | 'userTypeLabel'>): Observable<any> {
    const base =
      row.userTypeLabel === 'patient'
        ? URLConstant.recycleBinDeletePatient
        : row.userTypeLabel === 'doctor'
        ? URLConstant.recycleBinDeleteDoctor
        : row.userTypeLabel === 'hospital'
        ? URLConstant.recycleBinDeleteHospital
        : URLConstant.recycleBinDeleteEstablishment;
    return this.apiService.DeleteData(`${base}${row._id}`, {});
  }

  restore(row: Pick<RecycleBinRow, '_id'>): Observable<any> {
    return this.http.post(
      `${environment.API_BASE_URL}${URLConstant.recycleBinRestore}${row._id}`,
      {}
    );
  }
}

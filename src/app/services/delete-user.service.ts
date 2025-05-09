import { Injectable } from '@angular/core';
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
@Injectable({
  providedIn: 'root'
})
export class DeleteUserService {


  constructor(  private http: HttpClient,) { }
  url1 = `${environment.API_BASE_URL}v1/admin/delete-users`;
  url2 = `${environment.API_BASE_URL}v1/admin/delete-doctor-users`;
  url3 = `${environment.API_BASE_URL}v1/admin/delete-users`;

  DeletepatientList(userId: string) {
    console.log("deleteUser service");
    return this.http.delete(`${this.url1}/${userId}`);
  }
  DeleteDoctorList(userId: string) {
    console.log("deleteUser service");
    return this.http.delete(`${this.url2}/${userId}`);
  }
}


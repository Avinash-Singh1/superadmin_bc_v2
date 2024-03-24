import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { environment } from "../../environments/environment";
// import { NgxUiLoaderService } from 'ngx-ui-loader';
import { catchError, map, throwError } from "rxjs";
import { URLConstant } from "../apisURL/url";
@Injectable({
  providedIn: "root",
})
export class ApiService {
  constructor(
    private httpClient: HttpClient // private loader :NgxUiLoaderService
  ) {}
  url = environment.API_BASE_URL;

  ngOnInit() {}
  Postdata(endpoint: string, data: any, parameter: any) {
    // this.loader.start();
    let params = new HttpParams();
    params = params.appendAll(parameter);
    return this.httpClient
      .post(`${this.url + endpoint}`, data, { params: params })
      .pipe(
        catchError((message) => {
          // this.loader.stop();
          return throwError(message);
        }),
        map((response: any) => {
          // this.loader.stop();
          return response;
        })
      );
  }
  GetData(endpoint: string, payload: any) {
    // this.loader.start();
    let params = new HttpParams();
    params = params.appendAll(payload);

    return this.httpClient
      .get(`${this.url + endpoint}`, { params: params })
      .pipe(
        catchError((err) => {
          // this.loader.stop();
          return throwError(err.error);
        }),
        map((response: any) => {
          // this.loader.stop();
          return response;
        })
      );
  }
  PutData(endpoint: string, data: any, parameter: any) {
    let params = new HttpParams();
    params = params.appendAll(parameter);
    return this.httpClient.put(`${this.url + endpoint}`, data, {
      params: params,
    });
  }
  DeleteData(endpoint: string, payload: any) {
    let params = new HttpParams();
    params = params.appendAll(payload);

    return this.httpClient.delete(`${this.url + endpoint}`, { params: params });
  }
  patchData(endpoint: string, data: any, parameter: any) {
    let params = new HttpParams();
    params = params.appendAll(parameter);
    return this.httpClient.patch(`${this.url + endpoint}`, data, {
      params: params,
    });
  }
  fileUpload(file: any) {
    const formData = new FormData();
    formData.append("file", file);
    return this.httpClient.post(
      `${this.url + URLConstant.fileupload}`,
      formData
    );
  }
}

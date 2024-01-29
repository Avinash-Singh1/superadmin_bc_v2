import { Injectable } from "@angular/core";
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from "@angular/common/http";
import { map, timeout, catchError } from "rxjs/operators";
import { Observable, throwError } from "rxjs";
import { ToastrService } from "ngx-toastr";
import { Router } from "@angular/router";
import { environment } from "src/environments/environment";
import { MatDialog } from "@angular/material/dialog";

@Injectable()
export class InterceptorInterceptor implements HttpInterceptor {
  constructor(
    private route: Router,
    private toastr: ToastrService,
    private matdialog: MatDialog
  ) {}
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token: string | null = localStorage.getItem("token1");
    request = request.clone({
      headers: request.headers
        .set("Authorization", `Bearer ${token}`)
        .set("x-api-key", environment.X_API_KEY),
    });
    return next.handle(request).pipe(
      timeout(25000),
      map((event: HttpEvent<any>) => {
        return event;
      }),
      catchError((error: HttpErrorResponse) => {
        const { status } = error;
        const { message } = error.error || error;
        if (status == 401) {
          this.matdialog.closeAll();
          localStorage.clear();
          this.route.navigate([""]);
        }
        this.toastr.error(message);
        return throwError(() => {
          return error;
        });
      })
    );
  }
}

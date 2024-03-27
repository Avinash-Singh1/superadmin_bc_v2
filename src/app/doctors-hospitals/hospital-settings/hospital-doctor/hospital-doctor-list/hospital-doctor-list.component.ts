import { Component, OnDestroy, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ngxCsv } from "ngx-csv";
import { Subject, Subscription, debounceTime } from "rxjs";
import { EventService } from "src/app/services/event.service";
import { DoctorProfileComponent } from "../components/doctor-profile/doctor-profile.component";
import { EditDoctorComponent } from "../components/edit-doctor/edit-doctor.component";
import { DoctorRequestListComponent } from "../components/doctor-request-list/doctor-request-list.component";
import { AddDoctorFirstComponent } from "../components/add-doctor-first/add-doctor-first.component";
import { FormatarrayPipe } from "src/app/shared/pipes/formatarray.pipe";
import { ApiService } from "src/app/shared/api.service";
import { URLConstant } from "src/app/apisURL/url";
import { LocalStorageService } from "src/app/services/storage.service";

@Component({
  selector: "nectar-hospital-doctor-list",
  templateUrl: "./hospital-doctor-list.component.html",
  styleUrls: ["./hospital-doctor-list.component.scss"],
  providers: [FormatarrayPipe],
})
export class HospitalDoctorListComponent implements OnInit, OnDestroy {
  constructor(
    private eventService: EventService,
    private matdialog: MatDialog,
    private apiService: ApiService,
    private formatArray: FormatarrayPipe,
    private localStorage: LocalStorageService
  ) {}

  userId?: string = this.localStorage.getItem("userId");
  totalRequest: number = 0;
  doctorRequestList: any = [];
  payload: any = {
    page: 1,
    size: 10,
  };
  GENDER = {
    1: "Male",
    2: "Female",
    3: "Other",
  };
  searchSubject = new Subject();
  totalItems: number = 0;
  doctorList: any = [];
  request$!: Subscription;
  ngOnInit(): void {
    this.getDoctorList();
    this.searchPatient();
    this.getDoctorRequestList();
    this.getEvents();
  }
  openSidenav() {
    this.eventService.broadcastEvent("sidenav", true);
  }
  onSorting(columnName: string, order: string) {
    this.payload.page = 1;
    this.payload.sortBy = columnName;
    this.payload.order = order;
    this.getDoctorList();
  }

  onPageChange(event: any) {
    this.payload.page = event;
    this.getDoctorList();
  }
  showHistory(userId: string) {
    this.apiService
      .GetData(URLConstant.doctorProfileHospital, {
        userId,
      })
      .subscribe({
        next: (res: any) => {
          this.matdialog.open(DoctorProfileComponent, {
            autoFocus: false,
            width: "740px",
            data: {
              doctorDetail: res.result[0],
            },
          });
        },
      });
  }
  onEdit(doctor: any) {
    const editDoctorDialog = this.matdialog.open(EditDoctorComponent, {
      width: "80vw",
      data: {
        doctorDetail: doctor,
        userId: this.userId,
      },
    });
    editDoctorDialog.afterClosed().subscribe((res: boolean) => {
      if (res) {
        this.getDoctorList();
      }
    });
  }
  onSearch(event: any) {
    const search = event.target.value;
    this.searchSubject.next(search);
  }
  getDoctorList() {
    const payload = JSON.parse(JSON.stringify(this.payload));

    for (let key in payload) {
      if (!payload[key]) {
        delete payload[key];
      }
    }
    this.apiService
      .GetData(URLConstant.doctorListHospital, {
        ...payload,
        userId: this.userId,
      })
      .subscribe({
        next: (res: any) => {
          const { count, data } = res.result;
          if (count) {
            this.doctorList = data;
            this.totalItems = count;
            return;
          }
          this.doctorList = [];
          this.totalItems = 0;
        },
      });
  }
  searchPatient() {
    this.searchSubject.pipe(debounceTime(500)).subscribe((search) => {
      this.payload.search = search;
      this.getDoctorList();
    });
  }

  getDoctorRequestList() {
    this.apiService
      .GetData(URLConstant.doctorRequestList, {
        page: 1,
        size: 10,
        userId: this.userId,
      })
      .subscribe({
        next: (res: any) => {
          const { count, data } = res.result;
          if (count) {
            this.totalRequest = count;
            this.doctorRequestList = data;
          } else {
            this.doctorRequestList = [];
            this.totalRequest = 0;
          }
        },
      });
  }
  onRequestList() {
    this.matdialog.open(DoctorRequestListComponent, {
      data: {
        doctorList: this.doctorRequestList,
        totalItems: this.totalRequest,
        userId: this.userId,
      },
      autoFocus: false,
    });
  }
  getEvents() {
    this.request$ = this.eventService
      .getEvent("statusChanged")
      .subscribe((res: boolean) => {
        if (res) {
          this.getDoctorRequestList();
          this.getDoctorList();
        }
      });
  }
  onAdd() {
    this.matdialog.open(AddDoctorFirstComponent, {
      panelClass: "add-doctor-first",
      height: "90vh",
      width: "720px",
      autoFocus: false,
    });
  }
  onDelete(doctorId: string) {
    this.apiService
      .DeleteData(URLConstant.deleteDoctorHospital, {
        doctorId,
        userId: this.userId,
      })
      .subscribe({
        next: (res: any) => {
          this.totalItems -= 1;
          if (this.totalItems) {
            if (
              this.totalItems ==
              (this.payload.page - 1) * this.payload.size
            ) {
              this.payload.page = this.payload.page - 1;
            }
            this.getDoctorList();
          } else {
            this.doctorList = [];
          }
        },
      });
  }
  ngOnDestroy(): void {
    this.request$?.unsubscribe();
  }
}

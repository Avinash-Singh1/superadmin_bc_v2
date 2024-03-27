import { Component, Inject, OnInit } from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from "@angular/material/dialog";
import { URLConstant } from "src/app/apisURL/url";
import { EventService } from "src/app/services/event.service";
import { ApiService } from "src/app/shared/api.service";
import { DoctorProfileComponent } from "../doctor-profile/doctor-profile.component";

@Component({
  selector: "nectar-doctor-request-list",
  templateUrl: "./doctor-request-list.component.html",
  styleUrls: ["./doctor-request-list.component.scss"],
})
export class DoctorRequestListComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private matdialogRef: MatDialogRef<DoctorRequestListComponent>,
    private eventService: EventService,
    private matdialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
  payload: any = {
    page: 1,
    size: 10,
  };
  totalItems: number = 0;
  statusObj: { [key: number]: string } = {
    1: "Pending",
    2: "Accepted",
    3: "Rejected",
  };
  statusArray = [
    { label: "Accept", value: 2 },
    { label: "Reject", value: 3 },
  ];
  statusChanged: boolean = false;
  ngOnInit(): void {
    this.doctorList = this.data.doctorList;
    this.totalItems = this.data.totalItems;
    this.matdialogRef.afterClosed().subscribe((res: any) => {
      this.eventService.broadcastEvent("statusChanged", this.statusChanged);
    });
  }
  doctorList: any = [];
  changingPage(event: any) {
    this.payload.page = event;
    this.getdoctorList();
  }
  getdoctorList() {
    this.apiService
      .GetData(URLConstant.doctorRequestList, {
        ...this.payload,
        userId: this.data.userId,
      })
      .subscribe({
        next: (res: any) => {
          const { count, data } = res.result;
          this.doctorList = data;
          this.totalItems = count;
        },
        error: (error: any) => {
          console.log(error);
        },
      });
  }
  onSorting(columnName: string, order: string) {
    if (this.doctorList.length) {
      this.payload.sortBy = columnName;
      this.payload.order = order;
      this.payload.page = 1;
      this.getdoctorList();
    }
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
            width: "60vw",
            data: {
              doctorDetail: res.result[0],
            },
          });
        },
      });
  }
  onChangeStatus(status: number, details: any, i: number) {
    const payload = {
      isVerified: status,
    };
    const params = {
      doctorId: String(details.doctorId),
      userId: this.data.userId,
    };
    this.apiService
      .PutData(URLConstant.changedoctorRequestStatus, payload, params)
      .subscribe({
        next: (res: any) => {
          details.isVerified = status;
          this.statusChanged = true;
          this.getdoctorList();
        },
        error: (error: any) => {
          console.log(error);
        },
      });
  }
}

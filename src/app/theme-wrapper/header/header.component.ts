import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { NavigationEnd, Router } from "@angular/router";
import { filter } from "rxjs/operators";
import { URLConstant } from "src/app/apisURL/url";
import { AcceptRejectComponent } from "src/app/dialogs/accept-reject/accept-reject.component";
import { ViewDoctorHospitalComponent } from "src/app/dialogs/view-doctor-hospital/view-doctor-hospital.component";
import { ApiService } from "src/app/shared/api.service";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
})
export class HeaderComponent implements OnInit {
  @Output() sidebarToggle = new EventEmitter<boolean>();

  all: boolean = true;
  doctor: boolean = false;
  hospitaldata: boolean = false;
  toggleValue: boolean = true;
  pageTitle: string = "";

  private readonly titleMap: Record<string, string> = {
    dashboard:               "Welcome, Admin!",
    patient:                 "Patients",
    "doctor-hospital":       "Doctors / Hospitals",
    "request-approval":      "Request for Approval",
    "delete-reject-inactive":"User Management",
    review:                  "Review",
    appointment:             "Appointment",
    "speciality-procedure":  "Speciality & Procedure",
    settings:                "Settings",
    "sync-sitemap":          "Site Operations",
    blacklist:               "User Blacklist",
    "doctor-kyc":            "Doctor KYC",
    payments:                "Payments",
    payouts:                 "Payouts",
    reports:                 "Reports",
    surgery:                 "Surgery Care",
  };

  constructor(
    public apiservice: ApiService,
    public dialog: MatDialog,
    public route: Router
  ) {}

  ngOnInit(): void {
    this.toggleValue = localStorage.getItem("toggleSidenav") !== "false";
    this.notification();
    this.userProfile();
    this.pageTitle = this.titleFromUrl(this.route.url);
    this.route.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => { this.pageTitle = this.titleFromUrl(e.urlAfterRedirects); });
  }

  private titleFromUrl(url: string): string {
    const seg = url.split("/").filter(Boolean);
    // URL shape: /theme/<route-name>/...
    const key = seg[1] || "dashboard";
    return this.titleMap[key] ?? "";
  }

  getNotificationList: any;
  getdoctorNotiicationList: any;
  getHospitalNotificationList: any;
  notifiactionCount: any;
  unreadNotificationCount!: number;
  notification() {
    let param: any = {
      type: this.doctor == true ? 7 : this.hospitaldata == true ? 8 : "",
    };
    Object.keys(param).forEach((key) => {
      if (
        param[key] === null ||
        param[key] === undefined ||
        param[key] === ""
      ) {
        delete param[key];
      }
    });
    this.apiservice
      .GetData(URLConstant.notification, param)
      .subscribe((res: any) => {
        this.notifiactionCount = res?.result?.count;
        this.unreadNotificationCount = res?.result?.unreadNotification;
        if (this.all == true) {
          this.getNotificationList = res?.result?.data;
        } else if (this.doctor == true) {
          this.getdoctorNotiicationList = res?.result?.data;
        } else if (this.hospitaldata == true) {
          this.getHospitalNotificationList = res?.result?.data;
        }
        for (let i = 0; i < this.getNotificationList?.length; i++) {
          this.getNotificationList[i]["name"] = this.getNotificationList[
            i
          ]?.doctor?.name?.split(" ")
            ? this.getNotificationList[i]?.doctor?.name?.split(" ")
            : this.getNotificationList[i]?.hospital?.name?.split(" ");
        }
        for (let i = 0; i < this.getdoctorNotiicationList?.length; i++) {
          this.getdoctorNotiicationList[i]["name"] =
            this.getdoctorNotiicationList[i]?.doctor?.name?.split(" ");
        }
        for (let i = 0; i < this.getHospitalNotificationList?.length; i++) {
          this.getHospitalNotificationList[i]["name"] =
            this.getHospitalNotificationList[i]?.hospital?.name?.split(" ");
        }
      });
  }
  changeNotification(type: any) {
    if (type == "all") {
      this.all = true;
      this.doctor = false;
      this.hospitaldata = false;
    }
    if (type == "doctor") {
      this.all = false;
      this.doctor = true;
      this.hospitaldata = false;
    } else if (type == "hospital") {
      this.all = false;
      this.doctor = false;
      this.hospitaldata = true;
    }
  }

  acceptRejectNotification(
    components: any,
    value: any,
    id: any,
    status: any,
    type: any
  ) {
    if (status == "doctorAccept") {
      let param: any = {
        userId: id,
      };
      let status = {
        isVerified: 2,
      };
      this.apiservice
        .patchData(URLConstant.changeDoctorStatus, status, param)
        .subscribe((res: any) => {
          if (res?.success == true) {
            this.notification();
          }
        });
    }

    const dialogRef = this.dialog.open(AcceptRejectComponent, {
      maxHeight: "100vh",
      width: "720px",
      panelClass: "view-popup",
      data: {
        reject: value,
        userId: status == "doctorReject" ? id : "",
        hospitalId: status == "hospitalReject" ? id : "",
        viewId: id,
        value: value,
        userName: type,
      },
    });

    if (status == "doctorReject") {
      console.log("reecyed");
      dialogRef.afterClosed().subscribe((res: any) => {
        console.log("after not god");

        let status = {
          isVerified: res?.isVerified,
          rejectReason: res?.rejectReason,
        };
        let param = {
          userId: res?.userId,
        };
        this.apiservice
          .patchData(URLConstant.changeDoctorStatus, status, param)
          .subscribe((res: any) => {
            if (res?.success == true) {
              console.log("not god");
              this.notification();
            }
          });
      });
    }
  }

  hospitalAccept(components: any, value: any, id: any, status: any, type: any) {
    let param = {
      hospitalId: id,
    };
    let status1 = {
      isVerified: 2,
    };
    this.apiservice
      .patchData(URLConstant.changeStatusHospital, status1, param)
      .subscribe((res: any) => {
        if (res?.success == true) {
          this.notification();
        }
      });
    const dialogRef = this.dialog.open(AcceptRejectComponent, {
      maxHeight: "100vh",
      width: "720px",
      panelClass: "view-popup",
      data: {
        reject: value,
        userId: status == "doctorReject" ? id : "",
        hospitalId: status == "hospitalReject" ? id : "",
        viewId: id,
        value: value,
        userName: type,
      },
    });
    if (status == "hospitalReject") {
      dialogRef.afterClosed().subscribe((res: any) => {
        let status = {
          isVerified: res?.isVerified,
          rejectReason: res?.rejectReason,
        };
        let param = {
          hospitalId: res?.hospitalId,
        };
        if (param.hospitalId != undefined || param.hospitalId != null) {
          this.apiservice
            .patchData(URLConstant.changeStatusHospital, status, param)
            .subscribe((res: any) => {
              if (res?.success == true) {
                this.notification();
              }
            });
        }
      });
    }
  }

  logout() {
    localStorage.clear();
    this.route.navigate(["/"]);
  }
  viewdoctorHospital(value: any, id: any) {
    const dialogRef = this.dialog.open(ViewDoctorHospitalComponent, {
      maxHeight: "100vh",
      width: "720px",
      panelClass: "view-popup",
      data: {
        viewId: id,
        value: value,
      },
    });
  }
  profileDetail: any;
  clearNoti(payload: any, notificationId: string = "", index?: number) {
    let params = {};
    if ((this.doctor || this.hospitaldata) && !notificationId) {
      payload = { ...payload, eventType: this.doctor ? 7 : 8 };
    }
    if (notificationId) {
      params = { notificationId };
    }
    this.apiservice
      .PutData(URLConstant.notification, payload, params)
      .subscribe({
        next: (res: any) => {
          switch (true) {
            case this.all:
              if (notificationId) {
                this.getNotificationList.splice(index, 1);
                this.notifiactionCount--;
                return;
              }
              this.getNotificationList = [];
              this.notifiactionCount = 0;
              this.unreadNotificationCount = 0;
              break;
            case this.doctor:
              if (notificationId) {
                this.getdoctorNotiicationList.splice(index, 1);
                this.notifiactionCount--;
                return;
              }
              this.getdoctorNotiicationList = [];
              this.notifiactionCount = 0;
              break;
            case this.hospitaldata:
              if (notificationId) {
                this.getHospitalNotificationList.splice(index, 1);
                this.notifiactionCount--;
                return;
              }
              this.getHospitalNotificationList = [];
              this.notifiactionCount = 0;
          }
          console.log(res);
        },
        error: (error: any) => {
          console.log(error);
        },
      });
  }
  userProfile() {
    this.apiservice
      .GetData(URLConstant.profileDetail, "")
      .subscribe((res: any) => {
        this.profileDetail = res?.result;
      });
  }

  toggleSideBar() {
    this.toggleValue = !this.toggleValue;
    this.sidebarToggle.emit(this.toggleValue);
  }
}

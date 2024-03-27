import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { URLConstant } from "src/app/apisURL/url";
import { CommonAddModalComponent } from "src/app/doctors-hospitals/components/common-add-modal/common-add-modal.component";
import { EventService } from "src/app/services/event.service";
import { LocalStorageService } from "src/app/services/storage.service";
import { ApiService } from "src/app/shared/api.service";
import { HospitalDeleteModalComponent } from "src/app/shared/components/hospital-delete-modal/hospital-delete-modal.component";

@Component({
  selector: "nectar-hospital-procedure-list",
  templateUrl: "./hospital-procedure-list.component.html",
  styleUrls: ["./hospital-procedure-list.component.scss"],
})
export class HospitalProcedureListComponent implements OnInit {
  constructor(
    private eventService: EventService,
    private matdialog: MatDialog,
    private apiService: ApiService,
    private localStorage: LocalStorageService
  ) {}

  userId?: string = this.localStorage.getItem("userId");

  payload: any = {
    reverse: true,
  };
  apiCalled: boolean = false;
  sort!: string;
  totalItems: number = 0;
  procedureList: any = [];
  ngOnInit(): void {
    this.getprocedureList();
  }
  openSidenav() {
    this.eventService.broadcastEvent("sidenav", true);
  }
  onSorting(columnName: string, order: string) {
    this.payload.reverse = false;
    this.payload.sort = columnName;
    this.payload.sortOrder = order;
    if ((!this.sort || this.sort != order) && this.totalItems) {
      this.sort = order;
      this.getprocedureList();
    }
  }
  onDelete(recordId: string) {
    const deleteDialog = this.matdialog.open(HospitalDeleteModalComponent, {
      data: {
        heading: "Delete from Hospital profile?",
        message:
          "The procedure will be removed permanently. Do  you want to delete?",
      },
    });
    deleteDialog.afterClosed().subscribe((res: boolean) => {
      if (res) {
        this.apiService
          .DeleteData(URLConstant.procedureList, {
            recordId,
            userId: this.userId,
          })
          .subscribe({
            next: (res: any) => {
              this.getprocedureList();
            },
            error: (error: any) => {
              console.log(error);
            },
          });
      }
    });
  }
  onAdd() {
    const addDialog = this.matdialog.open(CommonAddModalComponent, {
      width: "720px",
      autoFocus: false,
      data: {
        masterKey: "procedure",
        addKey: "procedureList",
        userId: this.userId,
      },
    });
    addDialog.afterClosed().subscribe((res: boolean) => {
      if (res) {
        this.payload = {};
        this.getprocedureList();
      }
    });
  }
  getprocedureList() {
    const payload = JSON.parse(JSON.stringify(this.payload));
    for (let key in payload) {
      if (!payload[key]) {
        delete payload[key];
      }
    }
    this.apiService
      .GetData(URLConstant.procedureList, { ...payload, userId: this.userId })
      .subscribe({
        next: (res: any) => {
          this.apiCalled = true;

          const { count, list } = res.result;
          if (count) {
            this.procedureList = list;
            this.totalItems = count;
            return;
          }
          this.procedureList = [];
          this.totalItems = 0;
        },
        error: (error: any) => {
          this.apiCalled = true;
        },
      });
  }
}

import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { SettingsAddModalComponent } from "../settings-add-modal/settings-add-modal.component";
import { Subscription } from "rxjs";
import { EventService } from "src/app/services/event.service";
import { ApiService } from "src/app/shared/api.service";
import { URLConstant } from "src/app/apisURL/url";
import { HospitalDeleteModalComponent } from "src/app/shared/components/hospital-delete-modal/hospital-delete-modal.component";
import { LocalStorageService } from "src/app/services/storage.service";

@Component({
  selector: "nectar-services-list",
  templateUrl: "./services-list.component.html",
  styleUrls: ["./services-list.component.scss"],
})
export class ServicesListComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private matdialog: MatDialog,
    private eventService: EventService,
    private localStorage: LocalStorageService
  ) {}
  serviceList: any[] = [];

  deleteSubscription$!: Subscription;
  selectedId!: string;

  ngOnInit(): void {
    this.getServicesList();
    this.getEvents();
  }

  userId?: string = this.localStorage.getItem("userId");

  getServicesList() {
    this.apiService
      .GetData(URLConstant.serviceList, { userId: this.userId })
      .subscribe({
        next: (res: any) => {
          this.serviceList = res.result;
        },
        error: (error: any) => {
          console.log(error);
          this.serviceList = [];
        },
      });
  }
  onAddService() {
    const addDialog = this.matdialog.open(SettingsAddModalComponent, {
      width: "720px",
      data: {
        type: 1,
        heading: "Add Services",
        edit: false,
        apiEndpoints: URLConstant.addService,
      },
      autoFocus: false,
    });
    addDialog.afterClosed().subscribe((res: boolean) => {
      if (res) {
        this.getServicesList();
      }
    });
  }
  onDeleteService(serviceId: string) {
    this.selectedId = serviceId;
    this.matdialog.open(HospitalDeleteModalComponent, {
      data: {
        heading: "Delete from Hospital profile?",
        message: "The FAQ will be removed permanently. Do you want to delete?",
      },
    });
  }
  getEvents() {
    this.deleteSubscription$ = this.eventService
      .getEvent("entryDeleted")
      .subscribe((res: boolean) => {
        if (res) {
          this.apiService
            .DeleteData(URLConstant.deleteService, {
              serviceId: this.selectedId,
              userId: this.userId,
            })
            .subscribe({
              next: (res: any) => {
                this.selectedId = "";

                this.getServicesList();
              },
            });
        }
      });
  }
  ngOnDestroy(): void {
    this.deleteSubscription$?.unsubscribe();
  }
}

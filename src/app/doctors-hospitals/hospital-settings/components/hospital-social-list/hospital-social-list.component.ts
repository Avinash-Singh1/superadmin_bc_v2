import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Subscription } from "rxjs";
import { URLConstant } from "src/app/apisURL/url";
import { EventService } from "src/app/services/event.service";
import { LocalStorageService } from "src/app/services/storage.service";
import { ApiService } from "src/app/shared/api.service";
import { HospitalAddSocialmediaComponent } from "../hospital-add-socialmedia/hospital-add-socialmedia.component";

@Component({
  selector: "nectar-hospital-social-list",
  templateUrl: "./hospital-social-list.component.html",
  styleUrls: ["./hospital-social-list.component.scss"],
})
export class HospitalSocialListComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private matdialog: MatDialog,
    private eventService: EventService,
    private localStorage: LocalStorageService
  ) {}

  userId?: string = this.localStorage.getItem("userId");

  ngOnInit(): void {
    this.getSocialList();
    this.getEvents();
  }
  socialList: any[] = [];
  deleteSubscription$!: Subscription;
  selectedId!: string;

  getSocialList() {
    this.apiService
      .GetData(URLConstant.socialListHospital, { userId: this.userId })
      .subscribe({
        next: (res: any) => {
          this.socialList = res.result.social;
        },
        error: () => {
          this.socialList = [];
        },
      });
  }
  onAddSocialMedia() {
    const addDialog = this.matdialog.open(HospitalAddSocialmediaComponent, {
      width: "720px",
      data: {
        heading: "Add Social",
        edit: false,
        userId: this.userId,
      },
      autoFocus: false,
    });
    addDialog.afterClosed().subscribe((res: boolean) => {
      if (res) {
        this.getSocialList();
      }
    });
  }
  onEditSocialMedia(social: any) {
    this.selectedId = social._id;
    const editModal = this.matdialog.open(HospitalAddSocialmediaComponent, {
      width: "720px",
      data: {
        edit: true,
        patchValue: { social },
        heading: "Edit Socail",
        userId: this.userId,
      },
    });
    editModal.afterClosed().subscribe((res: boolean) => {
      if (res) {
        this.getSocialList();
      }
    });
  }
  getEvents() {
    this.deleteSubscription$ = this.eventService
      .getEvent("entryDeleted")
      .subscribe((res: boolean) => {
        if (res) {
          this.apiService
            .DeleteData(URLConstant.deleteSocialMedia, {
              socialId: this.selectedId,
              userId: this.userId,
            })
            .subscribe({
              next: (res: any) => {
                this.selectedId = "";

                this.getSocialList();
              },
            });
        }
      });
  }
  ngOnDestroy(): void {
    this.deleteSubscription$?.unsubscribe();
  }
}

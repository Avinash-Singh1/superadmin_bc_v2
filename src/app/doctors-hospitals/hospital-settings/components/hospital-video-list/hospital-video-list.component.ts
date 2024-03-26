import { Component, OnDestroy, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Subscription } from "rxjs";
import { EventService } from "src/app/services/event.service";
import { SettingsAddModalComponent } from "../settings-add-modal/settings-add-modal.component";
import { ApiService } from "src/app/shared/api.service";
import { APP_CONSTANTS } from "src/app/constant/app.constant";
import { URLConstant } from "src/app/apisURL/url";
import { LocalStorageService } from "src/app/services/storage.service";

type VideoList = { _id: string; url: string; updatedAt: Date };

@Component({
  selector: "nectar-hospital-video-list",
  templateUrl: "./hospital-video-list.component.html",
  styleUrls: ["./hospital-video-list.component.scss"],
})
export class HospitalVideoListComponent implements OnInit, OnDestroy {
  constructor(
    private apiService: ApiService,
    private matdialog: MatDialog,
    private eventService: EventService,
    private localStorage: LocalStorageService
  ) {}

  userId?: string = this.localStorage.getItem("userId");

  ngOnInit(): void {
    this.getvideoList();
    this.getEvents();
  }
  videoList: VideoList[] = [{ url: "" } as VideoList];
  deleteSubscription$!: Subscription;
  selectedId!: string;
  getvideoList() {
    this.apiService
      .GetData(URLConstant.videoList, {
        userType: APP_CONSTANTS.USER_TYPES.HOSPITAL,
        userId: this.userId,
      })
      .subscribe({
        next: (res: any) => {
          this.videoList = res.result;
        },
        error: () => {
          this.videoList = [];
        },
      });
  }
  onAddVideo() {
    const addDialog = this.matdialog.open(SettingsAddModalComponent, {
      width: "720px",
      data: {
        type: 3,
        heading: "Add New Video",
        apiEndpoints: URLConstant.addVideo,
        edit: false,
      },
      autoFocus: false,
    });
    addDialog.afterClosed().subscribe((res: boolean) => {
      if (res) {
        this.getvideoList();
      }
    });
  }
  onEditVideos(video: any) {
    this.selectedId = video._id;
    const editModal = this.matdialog.open(SettingsAddModalComponent, {
      width: "720px",
      data: {
        type: 3,
        edit: true,
        patchValue: video,
        heading: "Edit Video",
        apiEndpoints: URLConstant.editVideo,
        editKey: "videoId",
      },
    });
    editModal.afterClosed().subscribe((res: boolean) => {
      if (res) {
        this.getvideoList();
      }
    });
  }
  getEvents() {
    this.deleteSubscription$ = this.eventService
      .getEvent("entryDeleted")
      .subscribe((res: boolean) => {
        if (res) {
          this.apiService
            .DeleteData(URLConstant.deleteVideo, {
              videoId: this.selectedId,
              userId: this.userId,
            })
            .subscribe({
              next: (res: any) => {
                this.selectedId = "";

                this.getvideoList();
              },
            });
        }
      });
  }
  ngOnDestroy(): void {
    this.deleteSubscription$?.unsubscribe();
  }
}

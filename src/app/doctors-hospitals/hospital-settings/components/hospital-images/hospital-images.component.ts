import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { URLConstant } from "src/app/apisURL/url";
import { LocalStorageService } from "src/app/services/storage.service";
import { ApiService } from "src/app/shared/api.service";
import { HospitalDeleteModalComponent } from "src/app/shared/components/hospital-delete-modal/hospital-delete-modal.component";
import { UploadImageModalComponent } from "../upload-image-modal/upload-image-modal.component";

@Component({
  selector: "nectar-hospital-images",
  templateUrl: "./hospital-images.component.html",
  styleUrls: ["./hospital-images.component.scss"],
})
export class HospitalImagesComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private matdialog: MatDialog,
    private localStorage: LocalStorageService
  ) {}

  userId?: string = this.localStorage.getItem("userId");

  ngOnInit(): void {
    this.getImageList();
  }
  imageList: any[] = [];
  getImageList() {
    this.apiService
      .GetData(URLConstant.getImagesList, { userId: this.userId })
      .subscribe({
        next: (res: any) => {
          this.imageList = res.result;
        },
        error: () => {
          this.imageList = [];
        },
      });
  }
  onDelete(index: number, imageId: any) {
    const deleteDialog = this.matdialog.open(HospitalDeleteModalComponent, {
      data: {
        heading: "Delete from Hospital profile?",
        message: `The image will be removed permanently. Do you want to delete?`,
      },
    });
    deleteDialog.afterClosed().subscribe((res: boolean) => {
      if (res) {
        this.apiService
          .DeleteData(URLConstant.deleteImages, {
            imageId,
            userId: this.userId,
          })
          .subscribe({
            next: (res: any) => {
              this.imageList.splice(index, 1);
            },
          });
      }
    });
  }
  onAddImage() {
    const addDialog = this.matdialog.open(UploadImageModalComponent, {
      width: "600px",
      data: {
        userId: this.userId,
      },
    });
    addDialog.afterClosed().subscribe((res: boolean) => {
      if (res) this.getImageList();
    });
  }
}

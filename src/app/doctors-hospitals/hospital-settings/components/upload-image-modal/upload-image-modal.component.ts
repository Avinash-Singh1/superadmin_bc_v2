import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ToastrService } from "ngx-toastr";
import { URLConstant } from "src/app/apisURL/url";
import { ApiService } from "src/app/shared/api.service";

@Component({
  selector: "nectar-upload-image-modal",
  templateUrl: "./upload-image-modal.component.html",
  styleUrls: ["./upload-image-modal.component.scss"],
})
export class UploadImageModalComponent {
  constructor(
    private apiService: ApiService,
    private toastr: ToastrService,
    private matdialogRef: MatDialogRef<UploadImageModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  imageUrl!: string;
  imageFilter = ["image/png", "image/jpg", "image/jpeg"];

  onFileUpload(event: any) {
    if (event instanceof DragEvent) {
      const file = event.dataTransfer?.files[0] || ([] as any);

      if (!this.imageFilter.includes(file.type)) {
        this.toastr.error("Please upload images in jpeg, jpg or png format.");
        return;
      }
      if (file) {
        this.apiService.fileUpload(file).subscribe({
          next: (res: any) => {
            this.apiService
              .Postdata(
                URLConstant.addImages,
                {
                  image: { url: res.result.uri.uri },
                },
                {
                  userId: this.data.userId,
                }
              )
              .subscribe({
                next: (res: any) => {
                  this.matdialogRef.close(true);
                },
              });
          },
          error: (error: any) => {
            console.log(error);
          },
        });
      }
      return;
    }
    if (event.target?.files?.length) {
      const file = event.target.files[0];
      if (!this.imageFilter.includes(file.type)) {
        this.toastr.error("Please upload images in jpeg, jpg or png format.");
        return;
      }
      this.apiService.fileUpload(file).subscribe({
        next: (res: any) => {
          this.apiService
            .Postdata(
              URLConstant.addImages,
              {
                image: { url: res.result.uri.uri },
              },
              {
                userId: this.data.userId,
              }
            )
            .subscribe({
              next: (res: any) => {
                this.matdialogRef.close(true);
              },
            });
        },
        error: (error: any) => {
          console.log(error);
        },
      });
    }
  }
}

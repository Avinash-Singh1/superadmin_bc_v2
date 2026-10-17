import { Component } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { ToastrService } from "ngx-toastr";
import { ApiService } from "src/app/shared/api.service";

@Component({
  selector: "app-image-upload-modal",
  templateUrl: "./image-upload-modal.component.html",
  styleUrls: ["./image-upload-modal.component.scss"],
})
export class ImageUploadModalComponent {
  constructor(
    private apiService: ApiService,
    private toastr: ToastrService,
    public matdialogRef: MatDialogRef<ImageUploadModalComponent>
  ) {}

  acceptedFileType = ["image/jpeg", "image/jpg", "image/png", "image/svg+xml"];
  url!: string;
  submitted: boolean = false;

  onFileUpload(event: any) {
    const file = event?.target?.files?.[0];
    if (!file) {
      return;
    }
    if (!this.acceptedFileType.includes(file.type)) {
      this.toastr.error("Please upload file in jpeg, jpg, png or svg format");
      return;
    }
    this.apiService.fileUpload(file).subscribe({
      next: (res: any) => {
        const uri =
          res?.data?.url ||
          res?.result?.uri?.uri ||
          res?.result?.uri ||
          res?.result?.url;
        this.url = uri;
      },
      error: (err: any) => {
        this.toastr.error("File upload failed. Please try again.");
      },
    });
  }
}

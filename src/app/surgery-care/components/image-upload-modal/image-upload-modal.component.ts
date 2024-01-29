import { Component, OnInit } from "@angular/core";
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
  acceptedFileType = ["image/jpeg", "image/jpg", "image/png"];
  url!: string;
  submitted: boolean = false;
  onFileUpload(event: any) {
    console.log(event);
    const file = event?.target?.files?.[0];
    if (!this.acceptedFileType.includes(file.type)) {
      this.toastr.error("Please upload file in pdf, jpeg, jpg or png format");
      return;
    }
    this.apiService.fileUpload(file).subscribe({
      next: (res: any) => {
        const { uri } = res.result.uri;
        this.url = uri;
        // this.matdialogRef.close(uri);
      },
    });
  }
}

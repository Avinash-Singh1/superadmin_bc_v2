import { Component, Inject, OnInit } from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from "@angular/material/dialog";
import { ToastrService } from "ngx-toastr";
import { URLConstant } from "src/app/apisURL/url";
import { ApiService } from "src/app/shared/api.service";

@Component({
  selector: "app-delete-confirmation",
  templateUrl: "./delete-confirmation.component.html",
  styleUrls: ["./delete-confirmation.component.scss"],
})
export class DeleteConfirmationComponent implements OnInit {
  userId: string = "";
  text: string = "";
  type: string = "";
  isDisabled = false;

  constructor(
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<DeleteConfirmationComponent>,
    private apiservice: ApiService,
    public toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.userId = this.data.id;
    this.text = this.data.text;
    this.type = this.data.type;
  }

  closeModal() {
    this.dialog.closeAll();
  }

  delete() {
    this.isDisabled = true;

    // For patients, use the existing patient delete endpoint
    if (this.type === "patient") {
      this.apiservice
        .MarkDeleted(URLConstant.deletepatient, { userId: this.userId })
        .subscribe((res: any) => {
          if (res.success) this.dialogRef.close(true);
          return this.toastr.success(res.message);
        });
    }
    // For doctors/hospitals/establishments, use the SOFT DELETE endpoints
    // (moves the record into the recycle bin instead of hard-deleting it)
    else if (this.type === "doctor") {
      this.apiservice
        .PutData(URLConstant.softDeleteDoctor + this.userId, {}, {})
        .subscribe({
          next: (res: any) => {
            if (res.status === 200) {
              this.toastr.success("Doctor has been moved to recycle bin");
              this.dialogRef.close(true);
            }
          },
          error: (err: any) => {
            this.isDisabled = false;
            this.toastr.error(err?.error?.msgCode || "Failed to delete doctor");
          },
        });
    } else if (this.type === "hospital") {
      this.apiservice
        .PutData(URLConstant.softDeleteHospital + this.userId, {}, {})
        .subscribe({
          next: (res: any) => {
            if (res.status === 200) {
              this.toastr.success("Hospital has been moved to recycle bin");
              this.dialogRef.close(true);
            }
          },
          error: (err: any) => {
            this.isDisabled = false;
            this.toastr.error(err?.error?.msgCode || "Failed to delete hospital");
          },
        });
    } else if (this.type === "establishment") {
      this.apiservice
        .PutData(URLConstant.softDeleteEstablishment + this.userId, {}, {})
        .subscribe({
          next: (res: any) => {
            if (res.status === 200) {
              this.toastr.success("Establishment has been moved to recycle bin");
              this.dialogRef.close(true);
            }
          },
          error: (err: any) => {
            this.isDisabled = false;
            this.toastr.error(err?.error?.msgCode || "Failed to delete establishment");
          },
        });
    }
  }
}

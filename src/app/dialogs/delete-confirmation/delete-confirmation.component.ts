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
    // console.log("This tpye: ",this.type);
    if(this.type=='patient') {
          // console.log("pateint if condition",this.type);
          const url =
            this.type === "patient"
              ? URLConstant.deletepatient
              : URLConstant.deleteHospital;

          this.apiservice
            .MarkDeleted(url, { userId: this.userId })
            .subscribe((res: any) => {
              if (res.success) this.dialogRef.close(true);
              return this.toastr.success(res.message);
            });
    
    }else{
        // console.log(" not pateint if condition",this.type);
        const url =
        this.type === "doctor"
          ? URLConstant.deleteDoctor
          : URLConstant.deleteHospital;

      this.apiservice
        .DeleteData(url, { userId: this.userId })
        .subscribe((res: any) => {
          if (res.success) this.dialogRef.close(true);
          return this.toastr.success(res.message);
        });
    }

    
  }
}

import { Component, Inject, OnInit } from "@angular/core";
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from "@angular/material/dialog";
import { TranslateModule } from "@ngx-translate/core";
import { ToastrService } from "ngx-toastr";
import { URLConstant } from "src/app/apisURL/url";
import { ApiService } from "src/app/shared/api.service";
import { SharedModule } from "src/app/shared/shared.module";

@Component({
  selector: "nectar-common-add-modal",
  templateUrl: "./common-add-modal.component.html",
  styleUrls: ["./common-add-modal.component.scss"],
  standalone: true,
  imports: [
    TranslateModule,
    SharedModule,
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class CommonAddModalComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    public matdialogRef: MatDialogRef<CommonAddModalComponent>,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
  recordId: FormControl = new FormControl(null, [Validators.required]);
  suggestionList = [];
  placeHolder: string = "Select Speciality";
  ngOnInit(): void {
    if (this.data.addKey == "procedureList") {
      this.placeHolder = "Select Procedure";
    }
    this.getSpecialityList();
  }
  getSpecialityList() {
    this.apiService
      // @ts-ignore
      .GetData(URLConstant[this.data.masterKey], { userId: this.data.userId })
      .subscribe({
        next: (res: any) => {
          const { data } = res.result;
          this.suggestionList = data;
        },
        error: (error: any) => {
          console.log(error);
          this.suggestionList = [];
        },
      });
  }

  onSave() {
    if (this.recordId.valid && this.recordId)
      this.apiService
        .Postdata(
          // @ts-ignore
          URLConstant[this.data.addKey],
          {
            recordId: this.recordId.value,
          },
          {
            userId: this.data.userId,
          }
        )
        .subscribe({
          next: (res: any) => {
            this.matdialogRef.close(true);
            this.toastr.success("Speciality added successfully.");
          },
          error: (error: any) => {
            console.log(error);
          },
        });
  }
}

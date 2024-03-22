import { Component, Inject, OnInit } from "@angular/core";
import { UntypedFormControl, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { URLConstant } from "src/app/apisURL/url";
import { ApiService } from "src/app/shared/api.service";

@Component({
  selector: "app-comment-modal",
  templateUrl: "./comment-modal.component.html",
  styleUrls: ["./comment-modal.component.scss"],
})
export class CommentModalComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public matdialogRef: MatDialogRef<CommentModalComponent>
  ) {}
  comments: UntypedFormControl = new UntypedFormControl(this.data.comments, [
    Validators.required,
  ]);
  ngOnInit(): void {}
  onSave() {
    this.comments.markAsTouched();
    if (this.comments.valid) {
      console.log(this.comments);
      this.apiService
        .PutData(
          `${URLConstant.surgeryLeadChange}/${this.data.id}`,
          { comments: this.comments.value },
          {}
        )
        .subscribe({
          next: (res: any) => {
            this.matdialogRef.close(true);
          },
        });
    }
  }
}

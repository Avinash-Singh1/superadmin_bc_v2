import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { URLConstant } from "src/app/apisURL/url";
import { ApiService } from "src/app/shared/api.service";
import { CommentModalComponent } from "../comment-modal/comment-modal.component";

@Component({
  selector: "app-date-modal",
  templateUrl: "./date-modal.component.html",
  styleUrls: ["./date-modal.component.scss"],
})
export class DateModalComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public matdialogRef: MatDialogRef<DateModalComponent>
  ) {}
  today: Date = new Date();
  ngOnInit(): void {}
  onSelectDate(event: any) {
    const followUpDate = new Date(
      new Date(event).setHours(
        new Date().getHours(),
        new Date().getMinutes(),
        new Date().getSeconds()
      )
    ).toISOString();
    this.apiService
      .PutData(
        `${URLConstant.surgeryLeadChange}/${this.data.id}`,
        { followUpDate },
        {}
      )
      .subscribe({
        next: (res: any) => {
          this.matdialogRef.close(true);
        },
      });
  }
}

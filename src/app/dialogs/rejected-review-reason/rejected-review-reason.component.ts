import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { URLConstant } from 'src/app/apisURL/url';
import { ApiService } from 'src/app/shared/api.service';

@Component({
  selector: 'app-rejected-review-reason',
  templateUrl: './rejected-review-reason.component.html',
  styleUrls: ['./rejected-review-reason.component.scss']
})
export class RejectedReviewReasonComponent implements OnInit {

  constructor(
    private dialog:MatDialog,
     private apiservice:ApiService,
     @Inject(MAT_DIALOG_DATA) public data: any,

     ) { }
  rejectedReason:any;
  viewId:any;
  ngOnInit(): void {
    this.viewId=this.data?.id;
    this.viewReview();
  }
  closeModal(){
    this.dialog.closeAll()
  }

  viewReview(){
    let param={
      feedbackId:this.viewId
   }
   this.apiservice.GetData(URLConstant.viewReviewApproved,param).subscribe((res:any)=>{
   this.rejectedReason=res?.result[0]
   })
  }
}

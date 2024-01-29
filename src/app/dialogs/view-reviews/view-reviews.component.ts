import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { URLConstant } from 'src/app/apisURL/url';
import { ApiService } from 'src/app/shared/api.service';

@Component({
  selector: 'app-view-reviews',
  templateUrl: './view-reviews.component.html',
  styleUrls: ['./view-reviews.component.scss']
})
export class ViewReviewsComponent implements OnInit {
  public form:any;
  constructor(    
    private fb:FormBuilder,
    private apiservice:ApiService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ViewReviewsComponent>,
    private dialog:MatDialog


    ) {

   }
 
viewValue:any;
viewId:any
approvedViewDetail:any
userDetail:any=[]
treatment:any=[]
  ngOnInit(): void {
  this.viewValue=this.data.value;
  this.viewId=this.data.id;
  this.viewReview();
       this.form = this.fb.group({
        rating2: [this.stars]
      });
   
  
  }
  stars:any=[]
  viewReview(){
    let param={
       feedbackId:this.viewId
    }
    this.apiservice.GetData(URLConstant.viewReviewApproved,param).subscribe((res:any)=>{
    this.approvedViewDetail=res?.result[0]
    this.approvedViewDetail['name'] = this.approvedViewDetail?.doctorName?.split(' ');
    this.stars?.push(this.approvedViewDetail?.totalPoint)
       for(let i=0;i<this.approvedViewDetail?.treatment.length;i++){
     this.treatment.push(this.approvedViewDetail?.treatment[i])
     console.log("jdj",this.treatment)
    }
    this.userDetail=[
      {
        img:'assets/images/svg/pharmacy.svg',
        heading:'Hospital/Clinic',
        content:this.approvedViewDetail?.hospitalName
      },
      {
        img:'assets/images/svg/doctors.svg',
        heading:'Doctor',
        content:this.approvedViewDetail?.doctorName
      },
      {
        img:'assets/images/svg/kit.svg',
        heading:'Treatment',
        content:this.treatment
      },
      {
        img:'assets/images/svg/time.svg',
        heading:'Wait Time',
        content:this.approvedViewDetail?.waitTime
      }
  
    ]

    })
  }
  DeleteReviewComponent(){
    this.dialogRef.close({id:this.viewId})
  }
  closeModal(){
    this.dialog.closeAll();
  }

}

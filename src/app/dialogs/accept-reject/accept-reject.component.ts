import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { log } from 'console';
import { URLConstant } from 'src/app/apisURL/url';
import { ApiService } from 'src/app/shared/api.service';

@Component({
  selector: 'app-accept-reject',
  templateUrl: './accept-reject.component.html',
  styleUrls: ['./accept-reject.component.scss']
})
export class AcceptRejectComponent implements OnInit {
  rejected:boolean=false;
  accepted:boolean=true;
  rejectedSuccessfully:boolean=false;
  id:any
  rejectModal:any;
  hospitalId:any;
  type:any;
  username:any

  constructor(
  @Inject(MAT_DIALOG_DATA) public data: any,
  public dialogRef: MatDialogRef<AcceptRejectComponent>,
  private fb:FormBuilder,
  private apiService:ApiService,
  private dialog:MatDialog
  ) { }
  ngOnInit(): void {
    console.log('yesid',this.data?.userId)
this.username=this.data?.userName
console.log('username',this.username)
   this.type=this.data.type
    if(this.data.rejectedSuccessfully) {
      this.rejectedSuccessfully = true;
      this.accepted=false;
    }
    else this.rejectedSuccessfully = false;
    if(this.rejected){
      this.accepted=false;
    }
    this.id=this.data?.userId;
    this.hospitalId=this.data?.hospitalId
    this.rejectModal=this.fb.group({
      reject:['',[Validators.required]]
    })

    this.rejected=this.data?.reject;
    if(this.data?.reject==true){
    this.accepted=false;
    // this.rejectedSuccessfully=true;
    
    }
  }
closeModal(){
  this.dialogRef.close();
}
rejectRequest(){
  let status={
    isVerified:3,
    rejectReason:this.rejectModal?.value?.reject
  }
  let param={
    userId:this.id
  }
  if(this.rejectModal.valid){
  this.dialogRef.close({isVerified:3,rejectReason:this.rejectModal?.value?.reject,userId:this.id,hospitalId:this.hospitalId})
  if(this.data?.reject==true){
if(this.rejectedSuccessfully==true){
    const dialogref=this.dialog.open(AcceptRejectComponent,{
      maxHeight: '100vh',
      width: '720px',
      panelClass: 'view-popup',
      data:{
        rejectedSuccessfully:true
      }
    })
  }
}
}    
if(this.type=='rejectRequested'){
  if(this.rejectModal.valid){
    this.dialogRef.close({rejectReason:this.rejectModal?.value?.reject})
  }
  
}  
}

}

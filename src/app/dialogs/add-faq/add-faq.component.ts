import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { URLConstant } from 'src/app/apisURL/url';
import { ApiService } from 'src/app/shared/api.service';
import { DeleteFaqComponent } from '../delete-faq/delete-faq.component';

@Component({
  selector: 'app-add-faq',
  templateUrl: './add-faq.component.html',
  styleUrls: ['./add-faq.component.scss']
})
export class AddFaqComponent implements OnInit {
  addFaqForm:any;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data:any,
    private fb:FormBuilder,
    private apiService:ApiService,
    private dialog:MatDialog,
    private dialogRef:MatDialogRef<AddFaqComponent>) { }
header:any
id:any;
FaqDetail:any;
socialDetail:any;
FAQ:any;
submitted:boolean=false
  ngOnInit(): void {
    this.header=this.data?.type
    this.id=this.data?.id
    this.FAQ=this.data?.component
    this.getSocialList()
    this.faqForm();
    this.EditFaq();
  }
 

  faqForm(){
    this.addFaqForm=this.fb.group({
      question:['',[Validators.required]],
      answer:['',[Validators.required]]

    })
  }
  get f(){
    return this.addFaqForm.controls
  }
  addFaq(){
    console.log(this.addFaqForm)
    this.submitted=true;
    if(this.addFaqForm.valid && this.FAQ=='FAQ'){
    this.dialogRef.close({question:this.addFaqForm?.value?.question,answer:this.addFaqForm?.value?.answer})
    }
    else if(this.addFaqForm.valid && this.FAQ=='Social'){
      this.dialogRef.close({question:this.addFaqForm?.value?.question,answer:this.addFaqForm?.value?.answer})
    }
    
  }
  closeModal(){
    this.dialogRef.close()
  }
  EditFaq(){
    if(this.header=='Edit' && this.FAQ=='FAQ'){
      let param={
        id:this.id
      }
   this.apiService.GetData(URLConstant.addFaq+'/'+param?.id,'').subscribe((res:any)=>{
 this.FaqDetail=res?.result

 this.addFaqForm.patchValue({
  question:this.FaqDetail?.question,
  answer:this.FaqDetail?.answer
 })
   })
    }
    else if(this.header=='Edit' && this.FAQ=='Social'){
      let param={
        id:this.id
      }
   this.apiService.GetData(URLConstant.socialList+"/"+param?.id,'').subscribe((res:any)=>{
 this.socialDetail=res?.result

 this.addFaqForm.patchValue({
  question:this.socialDetail?.socialMediaId,
  answer:this.socialDetail?.url
 })
   })
    }

  }
  deleteFaq(){
    if(this.addFaqForm.valid && this.FAQ=='FAQ'){

      const dialogRef = this.dialog.open(DeleteFaqComponent, {
        maxHeight: '100vh',
        width: '720px',
        panelClass: 'view-popup',
        data:{
          id:this.id
        }
      })
      console.log(this.id)
      dialogRef.afterClosed().subscribe((res:any)=>{
        if(res?.data=='present'){
        this.dialogRef.close({id:this.id})
        }
      })

      }
     else if(this.addFaqForm.valid && this.FAQ=='Social'){
      this.dialogRef.close({id:this.id})
        }
  }
  socialValue:any

  getSocialList(){
    this.apiService.GetData(URLConstant.getSocialName,'').subscribe((res:any)=>{
this.socialValue=res?.result?.data
    })
  }
}

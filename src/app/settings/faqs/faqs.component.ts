import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { URLConstant } from 'src/app/apisURL/url';
import { AddFaqComponent } from 'src/app/dialogs/add-faq/add-faq.component';
import { ApiService } from 'src/app/shared/api.service';

@Component({
  selector: 'app-faqs',
  templateUrl: './faqs.component.html',
  styleUrls: ['./faqs.component.scss']
})
export class FaqsComponent implements OnInit {
faqResult:any
  constructor(public dialog:MatDialog,private apiService:ApiService,private toastr:ToastrService) { }

  ngOnInit(): void {
    this.faqList()
  }
  faqList(){
    this.apiService.GetData(URLConstant.faqList,'').subscribe((res:any)=>{
    this.faqResult=res?.result?.data
    })
  }
  addreview(type:any,id:any){
    const dialogRef = this.dialog.open(AddFaqComponent, {
      maxHeight: '100vh',
      width: '720px',
      panelClass: 'view-popup',
      data:{
        type:type,
        id:id,
        component:'FAQ',
        

      }
    })
    dialogRef.afterClosed().subscribe((res:any)=>{
      let body={
        question:res?.question,
        answer:res?.answer,
        
      }

      if(res?.question && res?.answer){
        if(type=='Add'){
     this.apiService.Postdata(URLConstant.addFaq,body,'').subscribe((res:any)=>{
        if(res?.success==true){
          this.toastr.success('FAQ has been add');
          this.faqList()
        }
      })
    }
    else if(type=='Edit'){
      this.apiService.PutData(URLConstant.addFaq+"/"+id,body,'').subscribe((res:any)=>{
        if(res?.success==true){
          // this.toastr.success('FAQ has been edit');
          this.faqList()
        }
      })
    }
   
    }
     if(res?.id){
      console.log('hello')
      this.apiService.DeleteData(URLConstant.addFaq+"/"+res?.id,'').subscribe((res:any)=>{
        if(res?.success==true){
          this.toastr.success('FAQ has been delete');
          this.faqList()
        }
      })
     }
    })
  }

}

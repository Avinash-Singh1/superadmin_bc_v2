import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { URLConstant } from 'src/app/apisURL/url';
import { AddFaqComponent } from 'src/app/dialogs/add-faq/add-faq.component';
import { ApiService } from 'src/app/shared/api.service';

@Component({
  selector: 'app-social',
  templateUrl: './social.component.html',
  styleUrls: ['./social.component.scss']
})
export class SocialComponent implements OnInit {
  constructor(public dialog:MatDialog,public apiService:ApiService,public toastr:ToastrService) { }
socialData:any
  ngOnInit(): void {
    this.socialList();
  }
  socialList(){
    this.apiService.GetData(URLConstant.socialList,'').subscribe((res:any)=>{
this.socialData=res?.result?.data

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
        component:'Social'

      }
    })
    dialogRef.afterClosed().subscribe((res:any)=>{
      let body={
        socialMediaId:res?.question,
        url:res?.answer,
        
      }

      if(res?.question && res?.answer){
        if(type=='Add'){
     this.apiService.Postdata(URLConstant.socialList,body,'').subscribe((res:any)=>{
        if(res?.success==true){
          this.toastr.success('Social has been add');
          this.socialList()
        }
      })
    }
    else if(type=='Edit'){
      this.apiService.PutData(URLConstant.socialList+"/"+id,body,'').subscribe((res:any)=>{
        if(res?.success==true){
          this.toastr.success('Social has been edit');
          this.socialList()
        }
      })
    }
   
    }
     if(res?.id){
      this.apiService.DeleteData(URLConstant.socialList+"/"+res?.id,'').subscribe((res:any)=>{
        if(res?.success==true){
          this.toastr.success('Social has been delete');
          this.socialList()
        }
      })
     }
    })
  }
}

import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { URLConstant } from 'src/app/apisURL/url';
import { ApiService } from 'src/app/shared/api.service';
import { UploadService } from 'src/app/shared/upload.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})


export class ProfileComponent implements OnInit {

  shortLink: string = "";
  file:any
  profileForm:any;
  profileImage:any;
  submitted:boolean=false;
  profileDetail:any;

  constructor(
    private uploadservice: UploadService,
    private http:HttpClient,
    private apiService:ApiService,
    private fb:FormBuilder,
    private toastr:ToastrService
    ) { }

  ngOnInit(): void {
    this.validateForm();
    this.patchProfileDetail()
  }
  validateForm() {
    this.profileForm = this.fb.group({
      profilePic: ["", [Validators.required]],
      fullName: ["", [Validators.required]],
      email:["",Validators.required]
    });
  }
  get control() {
    return this.profileForm.controls;
  }
  onChange(event:any) {
    this.file = event.target.files[0];
    const formData = new FormData(); 
  formData.append("file", this.file, this.file.name);
  console.log(formData)

  this.apiService.Postdata(URLConstant.fileupload,formData,{}).subscribe(
    (res) => {
      this.profileImage=res.result?.uri?.uri
      this.control["profilePic"].setValue(res.result?.uri?.uri);

      console.log(res);
    
    },
    (error) => {
    }
  );
}
updateProfile(){
  this.submitted=true
let body={
  profilePic:this.profileImage,
  fullName:this.profileForm?.value?.fullName,
  email:this.profileForm?.value?.email
}

if(this.profileForm.valid){
  this.apiService.PutData(URLConstant.updateProfile,body,'').subscribe((res:any)=>{
    if(res.success==true){
      this.toastr.success('Profile has been updated')
    }
  })
}
}
patchProfileDetail(){
  this.apiService.GetData(URLConstant.profileDetail,'').subscribe((res:any)=>{
    this.profileDetail=res?.result
     this.profileForm.patchValue({
      fullName:this.profileDetail?.fullName,
      email:this.profileDetail?.email,
       profilePic: this.profileDetail?.profilePic,

    })
  })
}

}



import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { URLConstant } from 'src/app/apisURL/url';
import { ApiService } from 'src/app/shared/api.service';

@Component({
  selector: 'app-password',
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.scss']
})
export class PasswordComponent implements OnInit {
  updatePasswordFrom:any;
  submitted:boolean=false;
  constructor(public fb:UntypedFormBuilder,public apiService:ApiService,private toastr:ToastrService,private route:Router) { }

  ngOnInit(): void {
    this.validateForm()
  }

  validateForm() {
    this.updatePasswordFrom = this.fb.group({
      oldPassword: ["", [Validators.required]],
      newPassword: ["", [Validators.required]],
      confirmPassword:["",Validators.required]
    });
  }
  get control() {
    return this.updatePasswordFrom.controls;
  }
  changePassword(){
    this.submitted=true
    let body=
    {
      currentPassword:this.updatePasswordFrom.value.oldPassword,
      newPassword:this.updatePasswordFrom.value.newPassword,
      confirmPassword:this.updatePasswordFrom.value.confirmPassword
  }
  if(this.updatePasswordFrom.valid){
this.apiService.PutData(URLConstant.changePassword,body,'').subscribe((res:any)=>{
  if(res?.success==true){
   this.toastr.success('Your password has been update');
   localStorage.clear();
  this.route.navigate(['/login'])
  //  this.updatePasswordFrom.reset()
  } 
})
  }
  }

}

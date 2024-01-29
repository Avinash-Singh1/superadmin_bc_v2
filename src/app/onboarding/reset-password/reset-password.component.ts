import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError } from 'rxjs';
import { URLConstant } from 'src/app/apisURL/url';
import { ApiService } from 'src/app/shared/api.service';
import { ValidationService } from 'src/app/shared/validation.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  submitted:boolean=false;
  resetpassword:any
  confirmPassword:any;
  password:any;
  show:boolean=false;
  hide:boolean=false;


  constructor(private fb:FormBuilder,
    public validationService: ValidationService,
    public apiservice:ApiService,
    public toastr:ToastrService,
    public route:Router
    ) { }
  pwdPattern = this.validationService.passwordPattern;

  ngOnInit(): void {
    this.password='password';
    this.confirmPassword='password'
    this.resetform();
  }
resetform(){
  this.resetpassword=this.fb.group({
    new_password:['',[Validators.required,Validators.minLength(8),Validators.pattern(this.validationService.passwordPattern)]],
    confirm_password:['',[Validators.required,Validators.minLength(8),Validators.pattern(this.validationService.passwordPattern)]],

  })
}
get f(){
  return this.resetpassword.controls
}
onSubmit(){
    this.submitted=true;
    if(this.resetpassword.valid){
      let data=
      {
        email:'admin@gmail.com',
        newPassword:this.resetpassword.value.new_password,
        confirmPassword:this.resetpassword.value.confirm_password
      }
      this.apiservice.Postdata(URLConstant.forgotPassword,data,{}).pipe(catchError((error) => {
        this.toastr.error("Reset passwords mismatched");
        return error;
      })).
      subscribe((res:any)=>{
       
        if(data){
          this.toastr.success("Password changed successfully")
          this.route.navigate(['/'])
        }
      })
    }
}
onClick() {
  if (this.password === 'password') {
   this.password = 'text';
   this.show = true;
 } else {
   this.password = 'password';
   this.show = false;
 }
}
onClickHide() {
 if (this.confirmPassword === 'password') {
   this.confirmPassword = 'text';
   this.hide = true;
 } else {
   this.confirmPassword = 'password';
   this.hide = false;
 }
}
}

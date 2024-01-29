import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError } from 'rxjs';
import { URLConstant } from 'src/app/apisURL/url';
import { ApiService } from 'src/app/shared/api.service';
import { ValidationService } from 'src/app/shared/validation.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

  forgotPasswordForm:any;
  submitted: boolean = false;
  
  constructor(
    private fb:FormBuilder,
    public validationService:ValidationService,
    public apiservice:ApiService,
    public toastr:ToastrService,
    public route:Router
    ){}
  ngOnInit(): void {
    this.loginfrom()
  }

  loginfrom(){
    this.forgotPasswordForm = this.fb.group({
      username: ['', [Validators.required, Validators.email, Validators.pattern(this.validationService.emailPattern)]],
    })

  }
  get f() {
    return this.forgotPasswordForm.controls;
  }
 

  forgotSubmit(){
    if(this.forgotPasswordForm.value.username=='admin@gmail.com'){
      this.route.navigate(['/resetpassword'])
    }
    else if(this.forgotPasswordForm.value.username==''){
      this.toastr.error('Please enter email ')
    }
    else{
      this.toastr.error('Email is not registered ')
    }

  }
}
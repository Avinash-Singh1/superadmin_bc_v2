import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthguardGuard } from '../shared/authguard.guard';
import { LoginComponent } from './login/login.component';
import { AuthWrapperComponent } from './auth-wrapper/auth-wrapper.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';

const routes: Routes = [
  {
    path: '',
    component: AuthWrapperComponent,
    children:[
      {
        path:'login',
        component:LoginComponent,
        canActivate:[AuthguardGuard]

      },
      {
        path:'forgotpassword',
        component:ForgotPasswordComponent,
        canActivate:[AuthguardGuard]

      },
      {
        path:'resetpassword',
        component:ResetPasswordComponent
      },
      {
        path:'',
        redirectTo:'login',
        pathMatch:'full'
      }
      // {
      //   path:'',
      //   component:ForgotPasswordComponent
      // },
    ]
  },
  {
    path:'forgotpassword',
    component:ForgotPasswordComponent
  }
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OnboardingRoutingModule { }

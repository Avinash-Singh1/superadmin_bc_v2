import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SettingWrapperComponent } from './setting-wrapper/setting-wrapper.component';
import { ProfileComponent } from './profile/profile.component';
import { PasswordComponent } from './password/password.component';
import { FaqsComponent } from './faqs/faqs.component';
import { SocialComponent } from './social/social.component';

const routes: Routes = [
  {
    path:'',
    component:SettingWrapperComponent,
    children:[
      {
        path:'',
        component:ProfileComponent
      },
      {
        path:'password',
        component:PasswordComponent
      },
      {
        path:'faq',
        component:FaqsComponent
      },
      {
        path:'social',
        component:SocialComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }

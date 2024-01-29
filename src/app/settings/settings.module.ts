import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SettingsRoutingModule } from './settings-routing.module';
import { SettingWrapperComponent } from './setting-wrapper/setting-wrapper.component';
import { ProfileComponent } from './profile/profile.component';
import { PasswordComponent } from './password/password.component';
import { FaqsComponent } from './faqs/faqs.component';
import { SocialComponent } from './social/social.component';
import { ThemeWrapperModule } from '../theme-wrapper/theme-wrapper.module';
import { SettingsidebarComponent } from './settingsidebar/settingsidebar.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    SettingWrapperComponent,
    ProfileComponent,
    PasswordComponent,
    FaqsComponent,
    SocialComponent,
    SettingsidebarComponent,
  ],
  imports: [
    CommonModule,
    SettingsRoutingModule,
    ThemeWrapperModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class SettingsModule { }

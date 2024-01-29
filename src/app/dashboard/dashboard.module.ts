import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { HomeComponent } from './home/home.component';
import { ThemeWrapperModule } from '../theme-wrapper/theme-wrapper.module';
import { MaterialModule } from '../material/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClickoutsideDirective } from '../custom-directives/clickoutside.directive';


@NgModule({
  declarations: [
    HomeComponent,
    ClickoutsideDirective
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    ThemeWrapperModule,
    MaterialModule,
    ThemeWrapperModule,
    ReactiveFormsModule,
    FormsModule,

  ]
})
export class DashboardModule { }

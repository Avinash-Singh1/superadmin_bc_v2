import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { AppointmentRoutingModule } from './appointment-routing.module';
import { AppointmentListComponent } from './appointment-list/appointment-list.component';
import { ProfileVisitsComponent } from './profile-visits/profile-visits.component';
import { ThemeWrapperModule } from '../theme-wrapper/theme-wrapper.module';
import { MaterialModule } from '../material/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';


@NgModule({
  declarations: [
    AppointmentListComponent,
    ProfileVisitsComponent
  ],
  imports: [
    CommonModule,
    AppointmentRoutingModule,
    ThemeWrapperModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
  ]
})
export class AppointmentModule { }

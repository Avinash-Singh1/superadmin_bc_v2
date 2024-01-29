import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RequestApprovalRoutingModule } from './request-approval-routing.module';
import { RequestsComponent } from './requests/requests.component';
import { MaterialModule } from '../material/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ThemeWrapperModule } from '../theme-wrapper/theme-wrapper.module';
import { NgxPaginationModule } from 'ngx-pagination';


@NgModule({
  declarations: [
    RequestsComponent
  ],
  imports: [
    CommonModule,
    RequestApprovalRoutingModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    ThemeWrapperModule,
    NgxPaginationModule
  ]
})
export class RequestApprovalModule { }

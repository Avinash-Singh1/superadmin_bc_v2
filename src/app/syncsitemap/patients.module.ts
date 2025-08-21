import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { syncsitemapRoutingModule } from './patients-routing.module';
import { PatientsListComponent } from './patients-list/patients-list.component';
import { ThemeWrapperModule } from '../theme-wrapper/theme-wrapper.module';
import { MaterialModule } from '../material/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [
    PatientsListComponent
  ],
  imports: [
    CommonModule,
    MatIconModule,
    syncsitemapRoutingModule,
    ThemeWrapperModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule
  ]
})
export class SyncsitemapModule { }

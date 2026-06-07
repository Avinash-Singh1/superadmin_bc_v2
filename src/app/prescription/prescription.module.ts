import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PrescriptionRoutingModule } from './prescription-routing.module';
import { PrescriptionListComponent } from './prescription-list/prescription-list.component';
import { PrescriptionDetailComponent } from './prescription-detail/prescription-detail.component';
import { ThemeWrapperModule } from '../theme-wrapper/theme-wrapper.module';
import { MaterialModule } from '../material/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { SafeUrlPipe } from '../shared/safe-url.pipe';

@NgModule({
  declarations: [PrescriptionListComponent, PrescriptionDetailComponent, SafeUrlPipe],
  imports: [
    CommonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    PrescriptionRoutingModule,
    ThemeWrapperModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    DatePipe,
  ],
  providers: [DatePipe],
})
export class PrescriptionModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DeleteRejectInactiveRoutingModule } from './delete-reject-inactive-routing.module';
import { DeleteRejectInactiveWrapperComponent } from './delete-reject-inactive-wrapper/delete-reject-inactive-wrapper.component';
import { DeletedComponent } from './deleted/deleted.component';
import { RejectedComponent } from './rejected/rejected.component';
import { InactiveComponent } from './inactive/inactive.component';
import { MaterialModule } from '../material/material';
import { ThemeWrapperModule } from '../theme-wrapper/theme-wrapper.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { GlobalsearchService } from '../shared/globalsearch.service';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [
    DeleteRejectInactiveWrapperComponent,
    DeletedComponent,
    RejectedComponent,
    InactiveComponent,
    
  ],
  imports: [
    CommonModule,
    DeleteRejectInactiveRoutingModule,
    MaterialModule,
    ThemeWrapperModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    NgxPaginationModule
  ],
  providers: [GlobalsearchService]

})
export class DeleteRejectInactiveModule { }

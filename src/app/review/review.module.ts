import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxStarRatingModule } from 'ngx-star-rating';
import { ReviewRoutingModule } from './review-routing.module';
import { ReviewListComponent } from './review-list/review-list.component';
import { ThemeWrapperModule } from '../theme-wrapper/theme-wrapper.module';
import { MaterialModule } from '../material/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { StarRatingModule } from 'angular-star-rating';


@NgModule({
  declarations: [
    ReviewListComponent
  ],
  imports: [
    CommonModule,
    ReviewRoutingModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,
    ThemeWrapperModule,
    NgxStarRatingModule,
    NgxPaginationModule,
    StarRatingModule.forRoot()
  ]
})
export class ReviewModule { }

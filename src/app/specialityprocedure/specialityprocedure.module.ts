import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SpecialityprocedureRoutingModule } from './specialityprocedure-routing.module';
import { SpecialityComponent } from './speciality/speciality.component';
import { ThemeWrapperModule } from '../theme-wrapper/theme-wrapper.module';
import { MaterialModule } from '../material/material';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    SpecialityComponent
  ],
  imports: [
    CommonModule,
    SpecialityprocedureRoutingModule,
    ThemeWrapperModule,
    MaterialModule,
    ReactiveFormsModule
  ]
})
export class SpecialityprocedureModule { }

import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { DoctorsHospitalsRoutingModule } from "./doctors-hospitals-routing.module";
import { DoctorhospitallistComponent } from "./doctorhospitallist/doctorhospitallist.component";
import { MaterialModule } from "../material/material";
import { ThemeWrapperModule } from "../theme-wrapper/theme-wrapper.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgxPaginationModule } from "ngx-pagination";

@NgModule({
  declarations: [DoctorhospitallistComponent],
  imports: [
    CommonModule,
    DoctorsHospitalsRoutingModule,
    MaterialModule,
    ThemeWrapperModule,
    ReactiveFormsModule,
    FormsModule,
    NgxPaginationModule,
  ],
})
export class DoctorsHospitalsModule {}

import { NgModule, PLATFORM_ID } from "@angular/core";
import { CommonModule } from "@angular/common";

import { HospitalSpecialityRoutingModule } from "./hospital-speciality-routing.module";
import { HospitalSpecialityListComponent } from "./hospital-speciality-list/hospital-speciality-list.component";
import { TranslateModule } from "@ngx-translate/core";
import { AngularSvgIconModule } from "angular-svg-icon";
import { NgxPaginationModule } from "ngx-pagination";
import { SharedModule } from "src/app/shared/shared.module";

@NgModule({
  declarations: [HospitalSpecialityListComponent],
  imports: [
    CommonModule,
    HospitalSpecialityRoutingModule,
    AngularSvgIconModule.forRoot(),
    NgxPaginationModule,
    TranslateModule,
    SharedModule,
  ],
})
export class HospitalSpecialityModule {}

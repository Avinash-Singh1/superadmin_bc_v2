import { NgModule, PLATFORM_ID } from "@angular/core";
import { CommonModule } from "@angular/common";

import { HospitalProcedureRoutingModule } from "./hospital-procedure-routing.module";
import { HospitalProcedureListComponent } from "./hospital-procedure-list/hospital-procedure-list.component";
import { TranslateModule } from "@ngx-translate/core";
import { AngularSvgIconModule, SvgLoader } from "angular-svg-icon";
import { NgxPaginationModule } from "ngx-pagination";
import { SharedModule } from "src/app/shared/shared.module";

@NgModule({
  declarations: [HospitalProcedureListComponent],
  imports: [
    CommonModule,
    HospitalProcedureRoutingModule,
    AngularSvgIconModule.forRoot(),
    NgxPaginationModule,
    TranslateModule,
    SharedModule,
  ],
})
export class HospitalProcedureModule {}

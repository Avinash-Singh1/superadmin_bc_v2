import { NgModule, PLATFORM_ID } from "@angular/core";
import { CommonModule } from "@angular/common";

import { DoctorSettingsRoutingModule } from "./doctor-settings-routing.module";
import { SettingsContainerComponent } from "./settings-container/settings-container.component";
import { AngularSvgIconModule, SvgLoader } from "angular-svg-icon";
// import { AngularMaterialModule } from "src/app/material.module";
import { TranslateModule } from "@ngx-translate/core";
// import { DoctorHospitalSharedModule } from "../../doctor-hospital-shared/doctor-hospital-shared.module";
import { HttpClient } from "@angular/common/http";
import { TransferState } from "@angular/platform-browser";
import { SharedModule } from "src/app/shared/shared.module";

@NgModule({
  declarations: [SettingsContainerComponent],
  imports: [
    CommonModule,
    DoctorSettingsRoutingModule,
    // AngularMaterialModule,
    SharedModule,
    AngularSvgIconModule.forRoot(),
    TranslateModule,
    // DoctorHospitalSharedModule,
  ],
})
export class DoctorSettingsModule {}

import { NgModule, PLATFORM_ID } from "@angular/core";
import { CommonModule } from "@angular/common";

import { DoctorSettingsRoutingModule } from "./doctor-settings-routing.module";
import { SettingsContainerComponent } from "./settings-container/settings-container.component";
import { AngularSvgIconModule, SvgLoader } from "angular-svg-icon";
import { TranslateModule } from "@ngx-translate/core";
import { ThemeWrapperModule } from "src/app/theme-wrapper/theme-wrapper.module";
import { SharedModule } from "src/app/shared/shared.module";

@NgModule({
  declarations: [SettingsContainerComponent],
  imports: [
    CommonModule,
    DoctorSettingsRoutingModule,
    AngularSvgIconModule.forRoot(),
    TranslateModule,
    ThemeWrapperModule,
    SharedModule,
  ],
})
export class DoctorSettingsModule {}

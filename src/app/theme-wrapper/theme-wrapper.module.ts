import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ThemeWrapperRoutingModule } from "./theme-wrapper-routing.module";
import { SidebarComponent } from "./sidebar/sidebar.component";
import { HeaderComponent } from "./header/header.component";
import { ThemeWrapperComponent } from "./theme-wrapper/theme-wrapper.component";
import { MaterialModule } from "../material/material";
import { TranslateModule } from "@ngx-translate/core";
import { AngularSvgIconModule } from "angular-svg-icon";

@NgModule({
  declarations: [SidebarComponent, HeaderComponent, ThemeWrapperComponent],
  imports: [
    CommonModule,
    ThemeWrapperRoutingModule,
    MaterialModule,
    TranslateModule,
    AngularSvgIconModule.forRoot(),
  ],
  exports: [HeaderComponent],
})
export class ThemeWrapperModule {}

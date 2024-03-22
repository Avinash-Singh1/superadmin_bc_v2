import { NgModule, PLATFORM_ID } from "@angular/core";
import { CommonModule } from "@angular/common";

import { ProfileRoutingModule } from "./profile-routing.module";
import { ProfileContainerComponent } from "./profile-container/profile-container.component";
import { DoctorProfileComponent } from "./pages/doctor-profile/doctor-profile.component";
import { AddMoreEditModalComponent } from "./components/add-more-edit-modal/add-more-edit-modal.component";
// import { AngularMaterialModule } from "src/app/material.module";
import { AngularSvgIconModule } from "angular-svg-icon";
import { DoctorEducationComponent } from "./pages/doctor-education/doctor-education.component";
import { ReactiveFormsModule } from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";
import { SharedModule } from "src/app/shared/shared.module";

@NgModule({
  declarations: [
    ProfileContainerComponent,
    DoctorProfileComponent,
    AddMoreEditModalComponent,
    DoctorEducationComponent,
  ],
  imports: [
    CommonModule,
    ProfileRoutingModule,
    // AngularMaterialModule,
    AngularSvgIconModule.forRoot(),
    ReactiveFormsModule,
    TranslateModule,
    SharedModule,
  ],
})
export class ProfileModule {}

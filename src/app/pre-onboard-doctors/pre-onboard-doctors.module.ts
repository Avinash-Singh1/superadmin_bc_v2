import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgxPaginationModule } from "ngx-pagination";
import { MaterialModule } from "../material/material";
import { PreOnboardDoctorsRoutingModule } from "./pre-onboard-doctors-routing.module";
import { PreOnboardDoctorsComponent } from "./pre-onboard-doctors.component";
import { AddPreOnboardDoctorComponent } from "./dialogs/add-pre-onboard-doctor/add-pre-onboard-doctor.component";

@NgModule({
  declarations: [
    PreOnboardDoctorsComponent,
    AddPreOnboardDoctorComponent,
  ],
  imports: [
    CommonModule,
    PreOnboardDoctorsRoutingModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,
    NgxPaginationModule,
  ],
})
export class PreOnboardDoctorsModule {}


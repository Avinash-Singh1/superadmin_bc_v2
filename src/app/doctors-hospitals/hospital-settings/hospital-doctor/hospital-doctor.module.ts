import { NgModule, PLATFORM_ID } from "@angular/core";
import { CommonModule } from "@angular/common";

import { HospitalDoctorRoutingModule } from "./hospital-doctor-routing.module";
import { HospitalDoctorListComponent } from "./hospital-doctor-list/hospital-doctor-list.component";
import { TranslateModule } from "@ngx-translate/core";
import { AngularSvgIconModule } from "angular-svg-icon";
import { NgxPaginationModule } from "ngx-pagination";
import { DoctorProfileComponent } from "./components/doctor-profile/doctor-profile.component";
import { SharedModule } from "src/app/shared/shared.module";
import { EditDoctorComponent } from "./components/edit-doctor/edit-doctor.component";
import { ReactiveFormsModule } from "@angular/forms";
import { DoctorRequestListComponent } from "./components/doctor-request-list/doctor-request-list.component";
import { AddDoctorFirstComponent } from "./components/add-doctor-first/add-doctor-first.component";
import { AddDoctorSecondComponent } from "./components/add-doctor-second/add-doctor-second.component";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatDialogModule } from "@angular/material/dialog";

@NgModule({
  declarations: [
    HospitalDoctorListComponent,
    DoctorProfileComponent,
    EditDoctorComponent,
    DoctorRequestListComponent,
    AddDoctorFirstComponent,
    AddDoctorSecondComponent,
  ],
  imports: [
    CommonModule,
    HospitalDoctorRoutingModule,
    AngularSvgIconModule.forRoot(),
    NgxPaginationModule,
    TranslateModule,
    SharedModule,
    ReactiveFormsModule,
    MatIconModule,
    MatMenuModule,
    MatDialogModule,
  ],
})
export class HospitalDoctorModule {}

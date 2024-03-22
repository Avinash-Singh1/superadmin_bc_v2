import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { DoctorhospitallistComponent } from "./doctorhospitallist/doctorhospitallist.component";

const routes: Routes = [
  {
    path: "",
    component: DoctorhospitallistComponent,
  },
  {
    path: "doctor/:userId",
    loadChildren: () =>
      import("./doctor-settings/doctor-settings.module").then(
        (m) => m.DoctorSettingsModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DoctorsHospitalsRoutingModule {}

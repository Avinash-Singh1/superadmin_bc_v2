import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PreOnboardDoctorsComponent } from "./pre-onboard-doctors.component";

const routes: Routes = [
  {
    path: "",
    component: PreOnboardDoctorsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PreOnboardDoctorsRoutingModule {}


import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ROUTE_CONSTANT } from "../constant/routeconstant";
import { SurgerLeadListComponent } from "./components/surger-lead-list/surger-lead-list.component";
import { AddSurgeryComponent } from "./components/add-surgery/add-surgery.component";
import { SurgeryListComponent } from "./components/surgery-list/surgery-list.component";
import { TreatmentCitiesComponent } from "./components/treatment-cities/treatment-cities.component";

const routes: Routes = [
  {
    path: ROUTE_CONSTANT.SURGERY.LEAD_LIST,
    component: SurgerLeadListComponent,
  },
  {
    path: ROUTE_CONSTANT.SURGERY.ADD_SURGERY,
    component: AddSurgeryComponent,
  },
  {
    path: ROUTE_CONSTANT.SURGERY.SURGERY_LIST,
    component: SurgeryListComponent,
  },
  {
    path: ROUTE_CONSTANT.SURGERY.TREATMENT_CITIES,
    component: TreatmentCitiesComponent,
  },
  {
    path: "",
    redirectTo: ROUTE_CONSTANT.SURGERY.LEAD_LIST,
    pathMatch: "full",
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SurgeryCareRoutingModule {}

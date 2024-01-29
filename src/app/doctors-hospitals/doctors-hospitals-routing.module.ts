import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DoctorhospitallistComponent } from './doctorhospitallist/doctorhospitallist.component';

const routes: Routes = [
  {
    path:'',
    component:DoctorhospitallistComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DoctorsHospitalsRoutingModule { }

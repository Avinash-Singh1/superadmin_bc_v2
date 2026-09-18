import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppointmentListComponent } from './appointment-list/appointment-list.component';
import { ProfileVisitsComponent } from './profile-visits/profile-visits.component';

const routes: Routes = [
  { path: 'visits', component: ProfileVisitsComponent },
  {
    path:'',
    component:AppointmentListComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppointmentRoutingModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppointmentListComponent } from './appointment-list/appointment-list.component';
import { ProfileVisitsComponent } from './profile-visits/profile-visits.component';
import { TeleconsultationMonitorComponent } from './teleconsultation-monitor/teleconsultation-monitor.component';

const routes: Routes = [
  { path: 'visits', component: ProfileVisitsComponent },
  { path: 'teleconsultation-monitor', component: TeleconsultationMonitorComponent },
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

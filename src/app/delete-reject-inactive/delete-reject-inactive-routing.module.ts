import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DeleteRejectInactiveWrapperComponent } from './delete-reject-inactive-wrapper/delete-reject-inactive-wrapper.component';
import { DeletedComponent } from './deleted/deleted.component';
import { RejectedComponent } from './rejected/rejected.component';
import { InactiveComponent } from './inactive/inactive.component';

const routes: Routes = [
  {
    path:'',
    component:DeleteRejectInactiveWrapperComponent,
    children:[
      {
        path:'',
        component:DeletedComponent
      },
      {
        path:'rejected',
        component:RejectedComponent
      },
      {
        path:'inactive',
        component:InactiveComponent
      }
    ]
  },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DeleteRejectInactiveRoutingModule { }

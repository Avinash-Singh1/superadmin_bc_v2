import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";
import { MaterialModule } from "../material/material";
import { NgxPaginationModule } from "ngx-pagination";
import { KycListComponent } from "./kyc-list/kyc-list.component";

const routes: Routes = [
  { path: "", component: KycListComponent },
];

@NgModule({
  declarations: [KycListComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    NgxPaginationModule,
    RouterModule.forChild(routes),
  ],
})
export class KycModule {}

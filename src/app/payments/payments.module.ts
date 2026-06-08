// src/app/payments/payments.module.ts
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";
import { MaterialModule } from "../material/material";
import { NgxPaginationModule } from "ngx-pagination";
import { PaymentsListComponent } from "./payments-list/payments-list.component";

const routes: Routes = [
  { path: "", component: PaymentsListComponent },
];

@NgModule({
  declarations: [PaymentsListComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    NgxPaginationModule,
    RouterModule.forChild(routes),
  ],
})
export class PaymentsModule {}

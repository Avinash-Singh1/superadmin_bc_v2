import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "../material/material";
import { ReportsListComponent } from "./reports-list/reports-list.component";

@NgModule({
  declarations: [ReportsListComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    RouterModule.forChild([
      { path: "", component: ReportsListComponent },
    ]),
  ],
})
export class ReportsModule {}

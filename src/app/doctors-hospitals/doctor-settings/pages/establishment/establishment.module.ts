import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { EstablishmentRoutingModule } from "./establishment-routing.module";
import { EstablishmentListComponent } from "./establishment-list/establishment-list.component";
import { AddEstablishmentComponent } from "./add-establishment/add-establishment.component";
import { AngularSvgIconModule } from "angular-svg-icon";
import { SharedModule } from "src/app/shared/shared.module";
import { TranslateModule } from "@ngx-translate/core";
import { EstablishmentRequestComponent } from "./establishment-request/establishment-request.component";
import { ReactiveFormsModule } from "@angular/forms";
import { NgxPaginationModule } from "ngx-pagination";
import { ConfirmEstablishmentComponent } from "./confirm-establishment/confirm-establishment.component";
import { MatDialogModule } from "@angular/material/dialog";
import { MatAutocompleteModule } from "@angular/material/autocomplete";

@NgModule({
  declarations: [
    EstablishmentListComponent,
    AddEstablishmentComponent,
    EstablishmentRequestComponent,
    ConfirmEstablishmentComponent,
  ],
  imports: [
    CommonModule,
    EstablishmentRoutingModule,
    AngularSvgIconModule.forRoot(),
    SharedModule,
    TranslateModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    MatDialogModule,
    SharedModule,
    MatAutocompleteModule,
  ],
  exports: [EstablishmentRequestComponent],
})
export class EstablishmentModule {}

import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "../material/material";
import { NgxEditorModule } from "ngx-editor";

import { FeatureAnnouncementsComponent } from "./feature-announcements/feature-announcements.component";
import { ComposeAnnouncementComponent } from "./compose-announcement/compose-announcement.component";

@NgModule({
  declarations: [FeatureAnnouncementsComponent, ComposeAnnouncementComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    NgxEditorModule,
    RouterModule.forChild([
      { path: "", component: FeatureAnnouncementsComponent },
    ]),
  ],
})
export class FeatureAnnouncementsModule { }

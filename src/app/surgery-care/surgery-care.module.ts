import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { SurgeryCareRoutingModule } from "./surgery-care-routing.module";
import { SurgerLeadListComponent } from "./components/surger-lead-list/surger-lead-list.component";
import { ThemeWrapperModule } from "../theme-wrapper/theme-wrapper.module";
import { NgxPaginationModule } from "ngx-pagination";
import { MaterialModule } from "../material/material";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommentModalComponent } from "./components/comment-modal/comment-modal.component";
import { DateModalComponent } from "./components/date-modal/date-modal.component";
import { AddSurgeryComponent } from "./components/add-surgery/add-surgery.component";
import { SurgeryListComponent } from "./components/surgery-list/surgery-list.component";
import { DeleteModalComponent } from "./components/delete-modal/delete-modal.component";
import { NgxEditorModule } from "ngx-editor";
import { EditorModalComponent } from "./components/editor-modal/editor-modal.component";
import { HtmlSanitizePipe } from "./pipes/html-sanitize.pipe";
import { EditSurgeryModalComponent } from "./components/edit-surgery-modal/edit-surgery-modal.component";
import { AngularSvgIconModule } from "angular-svg-icon";
import { FaqsModalComponent } from "./components/faqs-modal/faqs-modal.component";
import { ImageUploadModalComponent } from './components/image-upload-modal/image-upload-modal.component';
import { TreatmentCitiesComponent } from './components/treatment-cities/treatment-cities.component';

@NgModule({
  declarations: [
    SurgerLeadListComponent,
    CommentModalComponent,
    DateModalComponent,
    AddSurgeryComponent,
    SurgeryListComponent,
    DeleteModalComponent,
    EditorModalComponent,
    HtmlSanitizePipe,
    EditSurgeryModalComponent,
    FaqsModalComponent,
    ImageUploadModalComponent,
    TreatmentCitiesComponent,
  ],
  imports: [
    CommonModule,
    SurgeryCareRoutingModule,
    ThemeWrapperModule,
    NgxPaginationModule,
    MaterialModule,
    ReactiveFormsModule,
    NgxEditorModule,
    ReactiveFormsModule,
    FormsModule,
    AngularSvgIconModule.forRoot(),
  ],
})
export class SurgeryCareModule {}

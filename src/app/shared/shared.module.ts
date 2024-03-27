import { NgModule } from "@angular/core";
import { DeleteModalComponent } from "./components/delete-modal/delete-modal.component";
import { NgSelectModule } from "@ng-select/ng-select";
import { NameInitialPipe } from "./pipes/name-initial.pipe";
import { FormsModule } from "@angular/forms";
import { SanitizePipe } from "./pipes/sanitize.pipe";
import { FormFieldComponent } from "./components/form-field/form-field.component";
import { ErrorDirective } from "./directives/error.directive";
import { ErrorPipe } from "./pipes/error.pipe";
import { FormatarrayPipe } from "./pipes/formatarray.pipe";
import { GoogleMapsComponent } from "./components/google-maps/google-maps.component";
import { TimecomparePipe } from "./pipes/timecompare.pipe";
import { AgmCoreModule } from "@agm/core";
import { CommonModule } from "@angular/common";
import { HospitalDeleteModalComponent } from "./components/hospital-delete-modal/hospital-delete-modal.component";
import { TranslateModule } from "@ngx-translate/core";
import { ReplacePipe } from "./pipes/replace.pipe";
import { ImageViewModalComponent } from "./components/image-view-modal/image-view-modal.component";

const component = [
  DeleteModalComponent,
  NameInitialPipe,
  SanitizePipe,
  FormFieldComponent,
  ErrorDirective,
  ErrorPipe,
  FormatarrayPipe,
  GoogleMapsComponent,
  TimecomparePipe,
  HospitalDeleteModalComponent,
  ReplacePipe,
  ImageViewModalComponent,
];

const module = [
  NgSelectModule,
  FormsModule,
  AgmCoreModule,
  CommonModule,
  TranslateModule,
];

@NgModule({
  declarations: [component],
  imports: [module],
  exports: [component, module],
})
export class SharedModule {}

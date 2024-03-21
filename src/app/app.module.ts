import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MaterialModule } from "./material/material";
import { AddNewDoctorComponent } from "./dialogs/add-new-doctor/add-new-doctor.component";
import { AgmCoreModule } from "@agm/core";
import { ViewDoctorHospitalComponent } from "./dialogs/view-doctor-hospital/view-doctor-hospital.component";
import { AcceptRejectComponent } from "./dialogs/accept-reject/accept-reject.component";
import {
  HTTP_INTERCEPTORS,
  HttpClient,
  HttpClientModule,
} from "@angular/common/http";
import { InterceptorInterceptor } from "./shared/interceptor";
import { ToastrModule } from "ngx-toastr";
import { NgxStarRatingModule } from "ngx-star-rating";
import { NgMultiSelectDropDownModule } from "ng-multiselect-dropdown";
import { NgxUiLoaderConfig, NgxUiLoaderModule } from "ngx-ui-loader";
import { DatePipe } from "@angular/common";
import { ShowFullViewComponent } from "./dialogs/show-full-view/show-full-view.component";
import { ViewReviewsComponent } from "./dialogs/view-reviews/view-reviews.component";
import { DeleteReviewComponent } from "./dialogs/delete-review/delete-review.component";
import { RejectedReviewReasonComponent } from "./dialogs/rejected-review-reason/rejected-review-reason.component";
import { AddFaqComponent } from "./dialogs/add-faq/add-faq.component";
import { StarRatingConfigService, StarRatingModule } from "angular-star-rating";
import { OnlyNumberDirective } from "./custom-directives/only-number.directive";
import { DeleteFaqComponent } from "./dialogs/delete-faq/delete-faq.component";
import { DeleteProcedureComponent } from "./dialogs/delete-procedure/delete-procedure.component";
import { AddeditSpecialityComponent } from "./dialogs/addedit-speciality/addedit-speciality.component";
import { ReadMoreComponent } from "./dialogs/read-more/read-more.component";
import { environment } from "src/environments/environment";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { AngularSvgIconModule } from "angular-svg-icon";
import { NgxEditorModule } from "ngx-editor";
import { DeleteConfirmationComponent } from "./dialogs/delete-confirmation/delete-confirmation.component";

const ngxUiLoaderConfig: NgxUiLoaderConfig = {
  bgsColor: "blue",
  fgsColor: "red",
  pbColor: "green",
};

@NgModule({
  declarations: [
    AppComponent,
    AddNewDoctorComponent,
    ViewDoctorHospitalComponent,
    AcceptRejectComponent,
    ShowFullViewComponent,
    ViewReviewsComponent,
    DeleteReviewComponent,
    RejectedReviewReasonComponent,
    AddFaqComponent,
    OnlyNumberDirective,
    DeleteFaqComponent,
    DeleteProcedureComponent,
    AddeditSpecialityComponent,
    ReadMoreComponent,
    DeleteConfirmationComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    NgxUiLoaderModule.forRoot(ngxUiLoaderConfig),
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    MaterialModule,
    NgxStarRatingModule,
    AngularSvgIconModule.forRoot(),
    StarRatingModule.forRoot(),
    NgMultiSelectDropDownModule.forRoot(),
    ToastrModule.forRoot({
      timeOut: 2000,
      progressBar: true,
      preventDuplicates: true,
      closeButton: true,
      progressAnimation: "increasing",
      positionClass: "toast-top-right",
    }),
    NgxEditorModule,
    AgmCoreModule.forRoot({
      apiKey: environment.GOOGLE_API_KEY,
      libraries: ["places"],
    }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: InterceptorInterceptor,
      multi: true,
    },
    DatePipe,
    StarRatingConfigService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, "assets/i18n/", ".json");
}

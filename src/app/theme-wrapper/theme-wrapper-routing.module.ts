import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ThemeWrapperComponent } from "./theme-wrapper/theme-wrapper.component";
import { ROUTE_CONSTANT } from "../constant/routeconstant";

const routes: Routes = [
  {
    path: "",
    component: ThemeWrapperComponent,
    children: [
      {
        path: ROUTE_CONSTANT.DASHBOARD,
        loadChildren: () =>
          import("../dashboard/dashboard.module").then(
            (v) => v.DashboardModule
          ),
      },
      {
        path: ROUTE_CONSTANT.PATIENT,
        loadChildren: () =>
          import("../patients/patients.module").then((v) => v.PatientsModule),
      },
      {
        path: ROUTE_CONSTANT.DOCTOR_HOSPITAL,
        loadChildren: () =>
          import("../doctors-hospitals/doctors-hospitals.module").then(
            (v) => v.DoctorsHospitalsModule
          ),
      },
      {
        path: ROUTE_CONSTANT.REQUEST_APPROVAL,
        loadChildren: () =>
          import("../request-approval/request-approval.module").then(
            (v) => v.RequestApprovalModule
          ),
      },
      {
        path: ROUTE_CONSTANT.DELETE_REJECT_INACTIVE,
        loadChildren: () =>
          import(
            "../delete-reject-inactive/delete-reject-inactive.module"
          ).then((v) => v.DeleteRejectInactiveModule),
      },
      {
        path: ROUTE_CONSTANT.REVIEW,
        loadChildren: () =>
          import("../review/review.module").then((v) => v.ReviewModule),
      },
      {
        path: ROUTE_CONSTANT.APPOINTMENT,
        loadChildren: () =>
          import("../appointment/appointment.module").then(
            (v) => v.AppointmentModule
          ),
      },
      {
        path: ROUTE_CONSTANT.SPECIALITY_PROCEDURE,
        loadChildren: () =>
          import("../specialityprocedure/specialityprocedure.module").then(
            (v) => v.SpecialityprocedureModule
          ),
      },

      {
        path: ROUTE_CONSTANT.SETTINGS,
        loadChildren: () =>
          import("../settings/settings.module").then((v) => v.SettingsModule),
      },
      {
        path: ROUTE_CONSTANT.SYNC_SITEMAP,
        loadChildren: () =>
          import("../syncsitemap/patients.module").then((v) => v.SyncsitemapModule),
      },
      {
        path: ROUTE_CONSTANT.BLACKLIST,
        loadChildren: () =>
          import("../blackListUsers/blacklist.module").then((v) => v.BlacklistModule),
      },
      {
        path: ROUTE_CONSTANT.PRESCRIPTION,
        loadChildren: () =>
          import("../prescription/prescription.module").then((v) => v.PrescriptionModule),
      },
      
      {
        path: ROUTE_CONSTANT.SURGERY.SURGERY,
        loadChildren: () =>
          import("../surgery-care/surgery-care.module").then(
            (m) => m.SurgeryCareModule
          ),
      },
      {
        path: ROUTE_CONSTANT.KYC,
        loadChildren: () =>
          import("../kyc/kyc.module").then((v) => v.KycModule),
      },
      {
        path: ROUTE_CONSTANT.PAYMENTS,
        loadChildren: () =>
          import("../payments/payments.module").then((v) => v.PaymentsModule),
      },
      {
        path: ROUTE_CONSTANT.PAYOUTS,
        loadChildren: () =>
          import("../payouts/payouts.module").then((v) => v.PayoutsModule),
      },
      {
        path: ROUTE_CONSTANT.REPORTS,
        loadChildren: () =>
          import("../reports/reports.module").then((v) => v.ReportsModule),
      },
      {
        path: ROUTE_CONSTANT.FEATURE_ANNOUNCEMENTS,
        loadChildren: () =>
          import("../feature-announcements/feature-announcements.module").then(
            (m) => m.FeatureAnnouncementsModule
          ),
      },
      {
        path: "",
        redirectTo: ROUTE_CONSTANT.DASHBOARD,
        pathMatch: "full",
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ThemeWrapperRoutingModule {}

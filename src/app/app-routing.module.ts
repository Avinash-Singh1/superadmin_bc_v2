import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthguardGuard } from "./shared/authguard.guard";
import { ROUTE_CONSTANT } from "./constant/routeconstant";

const routes: Routes = [
  {
    path: ROUTE_CONSTANT.THEME,
    loadChildren: () =>
      import("./theme-wrapper/theme-wrapper.module").then(
        (m) => m.ThemeWrapperModule
      ),
  },
  {
    path: "",
    loadChildren: () =>
      import("../app/onboarding/onboarding.module").then(
        (m) => m.OnboardingModule
      ),
  },
  // {
  //   path:'home',
  //   loadChildren: () =>
  //   import('./dashboard/dashboard.module').then((m) => m.DashboardModule)
  // }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthguardGuard],
})
export class AppRoutingModule {}

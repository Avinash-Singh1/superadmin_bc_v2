import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { URLConstant } from "src/app/apisURL/url";
import { LocalStorageService } from "src/app/services/storage.service";
import { ApiService } from "src/app/shared/api.service";

@Component({
  selector: "nectar-hospital-delete-profile",
  templateUrl: "./hospital-delete-profile.component.html",
  styleUrls: ["./hospital-delete-profile.component.scss"],
})
export class HospitalDeleteProfileComponent {
  constructor(
    private localStorage: LocalStorageService,
    private apiService: ApiService,
    private route: Router
  ) {}

  submitForm() {
    this.apiService
      .DeleteData(URLConstant.deleteAccount, {})
      .subscribe((res: any) => {
        if (res?.success) {
          this.route.navigate(["/"]);
          this.localStorage.removeAllItem();
        }
      });
  }
}

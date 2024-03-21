import { Component, OnInit } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { CookieService } from "ngx-cookie-service";
import { ToastrService } from "ngx-toastr";
import { catchError } from "rxjs";
import { URLConstant } from "src/app/apisURL/url";
import { ApiService } from "src/app/shared/api.service";
import { CryptoService } from "src/app/shared/crypto.service";
import { ValidationService } from "src/app/shared/validation.service";
import packageJson from "../../../../package.json";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit {
  emailloginForm: any;
  submitted: boolean = false;
  DeviceID: any;
  rememberme: boolean = false;
  emailLogin: any = [];
  encryptedPassword: any;
  token: any;
  encryptedPrivilage: any;
  password: any;
  show: boolean = false;
  userProfileId: any;

  public version: string = packageJson.version;

  constructor(
    private fb: FormBuilder,
    public validationService: ValidationService,
    private apiService: ApiService,
    private toastr: ToastrService,
    public cookie: CookieService,
    private crypto: CryptoService,
    private route: Router
  ) {}
  ngOnInit(): void {
    this.password = "password";
    this.loginfrom();
  }

  loginfrom() {
    var today = Date.now();
    this.emailloginForm = this.fb.group({
      email: [
        "",
        [
          Validators.required,
          Validators.email,
          Validators.pattern(this.validationService.emailPattern),
        ],
      ],
      password: [
        "",
        [
          Validators.required,
          Validators.pattern(this.validationService.passwordPattern),
        ],
      ],
      deviceToken: (this.DeviceID + today)?.toString(),
      deviceId: this.DeviceID?.toString(),
      deviceType: "1",
    });
  }
  get f() {
    return this.emailloginForm.controls;
  }
  onSubmit() {
    this.submitted = true;
    this.DeviceID = sessionStorage.getItem("deviceId");
    this.emailloginForm.get("deviceId").setValue(this.DeviceID);
    this.emailloginForm.get("deviceToken").setValue("EMPTY");
    if (this.emailloginForm.valid) {
      let data: any = this.emailloginForm.value;
      this.apiService
        .Postdata(URLConstant.login, data, {})
        .pipe(
          catchError((error) => {
            return error;
          })
        )
        .subscribe((data: any) => {
          if (data.success) {
            this.userProfileId = data?.result?._id;
            localStorage.setItem("userprofileid", this.userProfileId);
            if (data.status_code == 200) {
              this.toastr.success("Login Successfully");
              if (this.rememberme) {
                this.encryptedPassword = this.crypto.encryptObj(
                  this.emailloginForm.value.password
                );
                this.cookie.set("email", this.emailloginForm.value.email);
                this.cookie.set("password", this.encryptedPassword);
              } else if (!this.rememberme) {
                this.cookie.deleteAll();
              }
              this.emailLogin = data;
              this.token = data.result.token;
              console.log("pityush", this.token);
              // if (data) {
              // }
              localStorage.setItem("token1", this.token);
              this.route.navigate(["/theme/dashboard"]);
            } else if (data.success_code == 200) {
              this.toastr.error(data.message);
            }
          }
        });
    }
  }
  onClick() {
    if (this.password === "password") {
      this.password = "text";
      this.show = true;
    } else {
      this.password = "password";
      this.show = false;
    }
  }
}

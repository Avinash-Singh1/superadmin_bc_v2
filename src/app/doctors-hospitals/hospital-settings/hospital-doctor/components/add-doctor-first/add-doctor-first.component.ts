import { Component, OnInit } from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { AddDoctorSecondComponent } from "../add-doctor-second/add-doctor-second.component";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { ApiService } from "src/app/shared/api.service";
import { URLConstant } from "src/app/apisURL/url";
import { LocalStorageService } from "src/app/services/storage.service";

@Component({
  selector: "nectar-add-doctor-first",
  templateUrl: "./add-doctor-first.component.html",
  styleUrls: ["./add-doctor-first.component.scss"],
})
export class AddDoctorFirstComponent implements OnInit {
  constructor(
    private matdialog: MatDialog,
    public matdialogRef: MatDialogRef<AddDoctorFirstComponent>,
    private fb: FormBuilder,
    private apiService: ApiService,
    private localStorage: LocalStorageService
  ) {}
  doctorForm!: FormGroup;

  userId?: string = this.localStorage.getItem("userId");

  ngOnInit(): void {
    this.validateForm();
  }
  onNext() {
    this.doctorForm.markAllAsTouched();

    if (this.doctorForm.valid) {
      const payload = JSON.parse(JSON.stringify(this.doctorForm.value));
      for (let key in payload) {
        if (!payload[key]) {
          delete payload[key];
        }
      }
      this.apiService.GetData(URLConstant.doctorDetail, payload).subscribe({
        next: (res: any) => {
          const secondscreen = this.matdialog.open(AddDoctorSecondComponent, {
            panelClass: "add-doctor-second",
            height: "90vh",
            width: "690px",
            autoFocus: false,
            data: { ...res.result, userId: this.userId },
          });
          secondscreen.afterClosed().subscribe((res: boolean) => {
            if (res) {
              this.matdialogRef.close();
            }
          });
        },
      });
    }
  }
  validateForm() {
    this.doctorForm = this.fb.group({
      phone: [null, []],
      publicUrl: [null, []],
    });
    this.doctorForm.setValidators(OnlyOneValue("phone", "publicUrl"));
  }
  get control() {
    return this.doctorForm.controls;
  }
}
export function OnlyOneValue(phone: string, publicUrl: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const passwordControl = control.get(phone);
    const publicUrlControl = control.get("publicUrl");
    const password = control.get(phone)?.value;
    const publicUrl = control.get("publicUrl")?.value;
    if ((password && publicUrl) || (!password && !publicUrl)) {
      return { onlyOne: true };
    } else if (password) {
      passwordControl?.setValidators([
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(14),
      ]);
    } else if (publicUrl) {
      publicUrlControl?.setValidators([
        Validators.required,
        Validators.maxLength(150),
        Validators.minLength(20),
      ]);
    }
    return null;
  };
}

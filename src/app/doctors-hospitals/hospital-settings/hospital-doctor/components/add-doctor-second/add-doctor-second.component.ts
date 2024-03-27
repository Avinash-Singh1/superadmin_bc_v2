import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { ToastrService } from "ngx-toastr";
import { URLConstant } from "src/app/apisURL/url";
import { ApiService } from "src/app/shared/api.service";

@Component({
  selector: "nectar-add-doctor-second",
  templateUrl: "./add-doctor-second.component.html",
  styleUrls: ["./add-doctor-second.component.scss"],
})
export class AddDoctorSecondComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public matdialogRef: MatDialogRef<AddDoctorSecondComponent>,
    private toastr: ToastrService
  ) {}
  ngOnInit(): void {
    this.getListing();
    this.validateForm();
  }
  doctorDetailForm!: FormGroup;
  specializationList = [];
  validateForm() {
    this.doctorDetailForm = this.fb.group({
      fullName: [{ value: "", disabled: true }, [Validators.required]],
      email: [{ value: "", disabled: true }],
      phone: [{ value: "", disabled: true }],
      specility: [null, [Validators.required]],
      consultationFees: ["", [Validators.required]],
    });
    this.doctorDetailForm.patchValue(this.data);
  }
  getListing() {
    this.apiService.GetData(URLConstant.specialization, {}).subscribe({
      next: (res: any) => {
        const { count, data } = res.result;
        if (count) {
          this.specializationList = data;
          return;
        }
        this.specializationList = [];
      },
    });
  }
  get control() {
    return this.doctorDetailForm.controls;
  }
  onSubmit() {
    this.doctorDetailForm.markAllAsTouched();
    if (this.doctorDetailForm.valid) {
      const payload = {
        ...this.doctorDetailForm.value,
        phone: this.data.phone,
      };
      this.apiService
        .Postdata(URLConstant.addDoctorHospital, payload, {
          userId: this.data.userId,
        })
        .subscribe({
          next: (res: any) => {
            this.toastr.success(res?.message);
            this.matdialogRef.close(true);
          },
        });
    }
  }
}

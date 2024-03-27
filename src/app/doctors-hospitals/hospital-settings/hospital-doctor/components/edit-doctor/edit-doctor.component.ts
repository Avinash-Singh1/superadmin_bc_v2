import { DatePipe } from "@angular/common";
import { Component, Inject, OnInit } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { URLConstant } from "src/app/apisURL/url";
import { CreateFormService } from "src/app/services/create-form.service";
import { FormValidationService } from "src/app/services/form-validation.service";
import { ApiService } from "src/app/shared/api.service";
import { environment } from "src/environments/environment";
@Component({
  selector: "nectar-edit-doctor",
  templateUrl: "./edit-doctor.component.html",
  styleUrls: ["./edit-doctor.component.scss"],
})
export class EditDoctorComponent implements OnInit {
  constructor(
    public matdialogRef: MatDialogRef<EditDoctorComponent>,
    private fb: FormBuilder,
    private datepipe: DatePipe,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private apiService: ApiService,
    private createForm: CreateFormService,
    private formValidation: FormValidationService
  ) {}

  selectedDay = new Set([]);
  specializationList = [];
  procedureList = [];
  doctorDetailForm!: FormGroup;
  currentDay: number = 0;
  weekArray = [
    { name: "Mon", selected: false, id: 0, formControlName: "mon" },
    { name: "Tue", selected: false, id: 1, formControlName: "tue" },
    { name: "Wed", selected: false, id: 2, formControlName: "wed" },
    { name: "Thu", selected: false, id: 3, formControlName: "thu" },
    { name: "Fri", selected: false, id: 4, formControlName: "fri" },
    { name: "Sat", selected: false, id: 5, formControlName: "sat" },
    { name: "Sun", selected: false, id: 6, formControlName: "sun" },
  ];
  timingArray: any = {
    0: this.generatTimiListing(
      new Date().setHours(0, 0, 0, 0),
      new Date().setHours(11, 45, 0, 0),
      environment.DOCTOR_SLOT_TIME
    ),
    1: this.generatTimiListing(
      new Date().setHours(12, 0, 0, 0),
      new Date().setHours(16, 45, 0, 0),
      environment.DOCTOR_SLOT_TIME
    ),
    2: this.generatTimiListing(
      new Date().setHours(17, 0, 0, 0),
      new Date().setHours(23, 45, 0, 0),
      environment.DOCTOR_SLOT_TIME
    ),
  };

  ngOnInit(): void {
    this.getListing();
    this.validateForm();
    this.onPatchFormData();
    this.maintainSelected();
  }
  maintainSelected() {
    this.weekArray.forEach((day: any) => {
      if (this.dayControl(day.formControlName).valid) {
        // @ts-ignore
        this.selectedDay.add(day.id);
        day.selected = true;
        this.currentDay = day.id;
      } else {
        this.control[day.formControlName].disable();
      }
    });
  }
  onPatchFormData() {
    const { doctorDetail } = this.data;
    const patchData = {
      fullName: doctorDetail.doctorDetails.doctorName,
      email: doctorDetail.doctorDetails?.email,
      phone: doctorDetail.doctorDetails?.phone,
      profilePic: doctorDetail.doctorDetails?.profilePic,
      procedure: doctorDetail?.procedure?.length
        ? (() => {
            return doctorDetail?.procedure.map((item: any) => item._id);
          })()
        : null,
      specility: doctorDetail?.specility?.length
        ? (() => {
            return doctorDetail?.specility.map((item: any) => item._id);
          })()
        : null,
      consultationFees: doctorDetail?.consultationFees,
      mon: doctorDetail.mon,
      tue: doctorDetail.tue,
      wed: doctorDetail.wed,
      thu: doctorDetail.thu,
      fri: doctorDetail.fri,
      sat: doctorDetail.sat,
      sun: doctorDetail.sun,
    };
    this.doctorDetailForm.patchValue(patchData);
  }
  getListing() {
    this.apiService.GetData(URLConstant.procedure, {}).subscribe({
      next: (res: any) => {
        const { count, data } = res.result;
        if (count) {
          this.procedureList = data;
          return;
        }
        this.procedureList = [];
      },
    });
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
  generatTimiListing(startTime: number, endTime: number, interval: number) {
    let timeList = [];
    for (let i = startTime; i <= endTime; i += interval) {
      timeList.push({
        name: this.datepipe.transform(new Date(i), "h:mm a"),
        _id: this.datepipe.transform(new Date(i), "h:mm a"),
      });
    }
    return timeList;
  }
  get control() {
    return this.doctorDetailForm.controls;
  }
  dayControl(day: string) {
    return this.control[day] as FormArray;
  }
  disableControl(...args: string[]) {
    args.forEach((controlName: string) => this.control[controlName].disable());
  }
  onSelectDay(data: any, index: number) {
    const { selected } = this.weekArray[index];
    if (selected && index == this.currentDay) {
      this.weekArray[index].selected = false;
      this.control[data.formControlName].reset();
      this.control[data.formControlName].disable();
      // @ts-ignore
      this.selectedDay.delete(data.id);
      if (this.selectedDay.size) {
        // @ts-ignore
        this.currentDay = [...this.selectedDay].pop();
        this.weekArray[this.currentDay].selected = true;
      } else {
        this.currentDay = 0;
        this.disableControl("mon", "tue", "wed", "thu", "fri", "sat", "sun");
      }
      return;
    }
    const previousDay = this.weekArray.findIndex((day: any) => {
      return day.id == this.currentDay;
    });
    if (previousDay != -1) {
      const error =
        this.control[this.weekArray[previousDay].formControlName].hasError(
          "atleatOnetiming"
        );
      if (error) {
        this.weekArray[previousDay].selected = false;
        // @ts-ignore
        this.selectedDay.delete(this.currentDay);
        this.control[this.weekArray[previousDay].formControlName].disable();
      }

      this.weekArray[index].selected = true;
      this.control[data.formControlName].enable();
      this.currentDay = data.id;
      // @ts-ignore
      this.selectedDay.add(data.id);
    }
  }
  validateForm() {
    this.doctorDetailForm = this.fb.group({
      fullName: [{ value: "", disabled: true }],
      phone: [{ value: "", disabled: true }],
      email: [{ value: "", disabled: true }],
      profilePic: [],
      specility: [null, [Validators.required]],
      procedure: [null, [Validators.required]],
      consultationFees: [null, [Validators.required]],
      mon: this.createForm.createDay(),
      tue: this.createForm.createDay(),
      wed: this.createForm.createDay(),
      thu: this.createForm.createDay(),
      fri: this.createForm.createDay(),
      sat: this.createForm.createDay(),
      sun: this.createForm.createDay(),
    });
    this.doctorDetailForm.setValidators(
      // @ts-ignore
      this.formValidation.atleastOneDay(
        "mon",
        "tue",
        "wed",
        "thu",
        "fri",
        "sat",
        "sun"
      )
    );
  }

  onSubmit() {
    this.doctorDetailForm.markAllAsTouched();
    if (this.doctorDetailForm.valid) {
      this.enableDisableControl();
      this.apiService
        .PutData(URLConstant.editDoctorProfile, this.doctorDetailForm.value, {
          doctorId: this.data.doctorDetail.doctorId,
          userId: this.data.userId,
        })
        .subscribe({
          next: (res: any) => {
            this.matdialogRef.close(true);
          },
          error: (error: any) => {
            this.enableDisableControl(true);
          },
        });
    }
  }
  enableDisableControl(enable: boolean = false) {
    this.weekArray.forEach((day: any) => {
      if (this.control[day.formControlName].status != "DISABLED") {
        this.dayControl(day.formControlName).controls.forEach(
          (slot: any, i: number) => {
            enable
              ? slot.enable()
              : Object.keys(slot.value).forEach((key: any) => {
                  if (slot.value?.[key] == null) {
                    slot.disable();
                  }
                });
          }
        );
      }
    });
  }
}

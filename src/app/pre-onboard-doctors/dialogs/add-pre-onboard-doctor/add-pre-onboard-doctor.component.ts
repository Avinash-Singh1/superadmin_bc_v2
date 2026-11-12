import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { ToastrService } from "ngx-toastr";
import { URLConstant } from "src/app/apisURL/url";
import { ApiService } from "src/app/shared/api.service";

interface DayTiming {
  dayKey: string;
  dayLabel: string;
  enabled: boolean;
  morningFrom: string;
  morningTo: string;
  eveningFrom: string;
  eveningTo: string;
}

@Component({
  selector: "app-add-pre-onboard-doctor",
  templateUrl: "./add-pre-onboard-doctor.component.html",
  styleUrls: ["./add-pre-onboard-doctor.component.scss"],
})
export class AddPreOnboardDoctorComponent implements OnInit {
  doctorForm!: FormGroup;
  specializationList: any[] = [];
  cityList: any[] = [];
  isSubmitting = false;
  isUploading = false;
  previewImage: string | null = null;

  days: DayTiming[] = [
    { dayKey: "mon", dayLabel: "Monday", enabled: true, morningFrom: "10:00 AM", morningTo: "01:00 PM", eveningFrom: "05:00 PM", eveningTo: "08:00 PM" },
    { dayKey: "tue", dayLabel: "Tuesday", enabled: true, morningFrom: "10:00 AM", morningTo: "01:00 PM", eveningFrom: "05:00 PM", eveningTo: "08:00 PM" },
    { dayKey: "wed", dayLabel: "Wednesday", enabled: true, morningFrom: "10:00 AM", morningTo: "01:00 PM", eveningFrom: "05:00 PM", eveningTo: "08:00 PM" },
    { dayKey: "thu", dayLabel: "Thursday", enabled: true, morningFrom: "10:00 AM", morningTo: "01:00 PM", eveningFrom: "05:00 PM", eveningTo: "08:00 PM" },
    { dayKey: "fri", dayLabel: "Friday", enabled: true, morningFrom: "10:00 AM", morningTo: "01:00 PM", eveningFrom: "05:00 PM", eveningTo: "08:00 PM" },
    { dayKey: "sat", dayLabel: "Saturday", enabled: true, morningFrom: "10:00 AM", morningTo: "01:00 PM", eveningFrom: "05:00 PM", eveningTo: "08:00 PM" },
    { dayKey: "sun", dayLabel: "Sunday", enabled: false, morningFrom: "10:00 AM", morningTo: "01:00 PM", eveningFrom: "05:00 PM", eveningTo: "08:00 PM" },
  ];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private toastr: ToastrService,
    public dialogRef: MatDialogRef<AddPreOnboardDoctorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadSpecializations();
    this.loadCities();
  }

  private initForm(): void {
    this.doctorForm = this.fb.group({
      fullName: ["", [Validators.required]],
      specialization: ["", [Validators.required]],
      city: ["", [Validators.required]],
      locality: [""],
      experience: ["5", [Validators.required, Validators.min(0)]],
      videoConsultationFees: [500, [Validators.required, Validators.min(0)]],
      phone: [""],
      about: [""],
      profilePic: [""],
    });
  }

  private loadSpecializations(): void {
    this.apiService.GetData(URLConstant.specialization, "").subscribe({
      next: (res: any) => {
        this.specializationList = res?.result?.data || res?.result || res?.data || [];
      },
      error: (err) => console.error("Error loading specializations", err),
    });
  }

  private loadCities(): void {
    this.apiService.GetData(URLConstant.cityList, "").subscribe({
      next: (res: any) => {
        this.cityList = res?.result?.data || res?.result || res?.data || [];
      },
      error: (err) => console.error("Error loading cities", err),
    });
  }

  onImageSelected(event: any): void {
    const file = event?.target?.files?.[0];
    if (!file) return;

    this.isUploading = true;
    const formData = new FormData();
    formData.append("file", file, file.name);

    this.apiService.Postdata(URLConstant.fileupload, formData, {}).subscribe({
      next: (res: any) => {
        this.isUploading = false;
        const uploadedUrl = res?.result?.uri?.uri || res?.result?.uri;
        if (uploadedUrl) {
          this.previewImage = uploadedUrl;
          this.doctorForm.patchValue({ profilePic: uploadedUrl });
          this.toastr.success("Profile photo uploaded successfully!");
        }
      },
      error: (err) => {
        this.isUploading = false;
        console.error("Upload error", err);
        this.toastr.error("Failed to upload profile image.");
      },
    });
  }

  removeImage(): void {
    this.previewImage = null;
    this.doctorForm.patchValue({ profilePic: "" });
  }

  toggleDay(day: DayTiming): void {
    day.enabled = !day.enabled;
  }

  private buildTimingsPayload(): Record<string, any[]> {
    const timings: Record<string, any[]> = {};
    for (const d of this.days) {
      if (!d.enabled) {
        timings[d.dayKey] = [];
        continue;
      }
      const slots: any[] = [];
      if (d.morningFrom && d.morningTo) {
        slots.push({ slot: "morning", from: d.morningFrom, to: d.morningTo });
      }
      if (d.eveningFrom && d.eveningTo) {
        slots.push({ slot: "evening", from: d.eveningFrom, to: d.eveningTo });
      }
      timings[d.dayKey] = slots;
    }
    return timings;
  }

  onSubmit(): void {
    if (this.doctorForm.invalid) {
      this.doctorForm.markAllAsTouched();
      this.toastr.warning("Please fill all required fields correctly.");
      return;
    }

    this.isSubmitting = true;
    const formValues = this.doctorForm.value;
    const timings = this.buildTimingsPayload();

    const payload = {
      fullName: formValues.fullName,
      specialization: formValues.specialization,
      city: formValues.city,
      locality: formValues.locality,
      experience: formValues.experience,
      videoConsultationFees: Number(formValues.videoConsultationFees) || 500,
      phone: formValues.phone,
      about: formValues.about,
      profilePic: formValues.profilePic,
      timings,
    };

    this.apiService.Postdata(URLConstant.adminPreOnboardDoctor, payload, {}).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        this.toastr.success("Doctor pre-onboarded successfully!");
        this.dialogRef.close({ refresh: true, result: res?.result?.data });
      },
      error: (err: any) => {
        this.isSubmitting = false;
        console.error("Error creating doctor", err);
        const errMsg = err?.error?.message || "Failed to pre-onboard doctor.";
        this.toastr.error(errMsg);
      },
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}


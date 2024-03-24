import { Component, OnDestroy, OnInit } from "@angular/core";
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { Subscription } from "rxjs";
import { URLConstant } from "src/app/apisURL/url";
import { EventService } from "src/app/services/event.service";
import { LocalStorageService } from "src/app/services/storage.service";
import { ApiService } from "src/app/shared/api.service";
@Component({
  selector: "nectar-doctor-profile",
  templateUrl: "./doctor-profile.component.html",
  styleUrls: ["./doctor-profile.component.scss"],
})
export class DoctorProfileComponent implements OnInit, OnDestroy {
  data: any;
  getimgUrl: any;
  specializationList: any;
  videoSubmitted: boolean = false;
  profileForm!: UntypedFormGroup;
  experinenceYear: any[] = [];
  eventSubscriptionDP$: Subscription;

  constructor(
    private fb: UntypedFormBuilder,
    private apiSerive: ApiService,
    public toastr: ToastrService,
    private eventService: EventService,
    private storageService: LocalStorageService
  ) {
    this.eventSubscriptionDP$ = this.eventService
      .getEvent("userId")
      .subscribe((res: string) => {
        if (res) this.userId = res;
      });
  }

  userId: string = this.storageService.getItem("userId");
  getFormValues: any;

  ngOnInit(): void {
    this.generateList();
    this.validateForm();
    this.specialization();
    this.editForm();
  }
  get control() {
    return this.profileForm.controls;
  }
  generateList() {
    for (let i = 0; i <= 70; i++) {
      this.experinenceYear.push({ label: String(i), value: String(i) });
    }
  }
  validateForm() {
    this.profileForm = this.fb.group({
      profilePic: [""],
      fullName: ["", [Validators.required]],
      specialization: [null, [Validators.required]],
      experience: [null, [Validators.required]],
      about: ["", [Validators.required]],
    });
  }
  isProfilePic: boolean = false;
  onFileUpload(event: any) {
    if (event.target?.files?.length) {
      this.apiSerive.fileUpload(event.target.files[0]).subscribe({
        next: (res: any) => {
          this.isProfilePic = true;
          this.control["profilePic"].setValue(res.result?.uri?.uri);
        },
        error: (error: any) => {
          console.log(error);
        },
      });
    }
  }

  submitForm() {
    this.profileForm.markAllAsTouched();
    if (this.profileForm.valid) {
      Object.keys(this.profileForm.value).forEach((key) => {
        if (this.profileForm.value[key] === null) {
          delete this.profileForm.value[key];
        }
      });
      this.apiSerive
        .PutData(URLConstant.updateDoctorProfile, this.profileForm.value, {
          userId: this.userId,
        })
        .subscribe((res: any) => {
          if (res?.success) {
            this.eventService.broadcastEvent(
              "profileDetailsChanged",
              this.profileForm.value
            );
            this.toastr.success("Profile has been updated");
          }
        });
    }
  }

  editForm() {
    this.apiSerive
      .GetData(URLConstant.updateDoctorProfile, { userId: this.userId })
      .subscribe((res: any) => {
        this.getFormValues = res?.result[0];
        if (this.getFormValues?.doctor?.profilePic) {
          this.isProfilePic = true;
        }
        this.profileForm.patchValue({
          profilePic: this.getFormValues?.doctor?.profilePic,
          fullName: this.getFormValues?.fullName,
          experience: this.getFormValues?.doctor?.experience,
          specialization: this.getFormValues?.doctor?.specialization,
          about: this.getFormValues?.doctor?.about,
        });
      });
  }
  specialization() {
    this.apiSerive
      .GetData(URLConstant.specialization, "")
      .subscribe((res: any) => {
        this.specializationList = res?.result?.data;
      });
  }
  ngOnDestroy(): void {
    if (this.eventSubscriptionDP$) this.eventSubscriptionDP$.unsubscribe();
  }
}

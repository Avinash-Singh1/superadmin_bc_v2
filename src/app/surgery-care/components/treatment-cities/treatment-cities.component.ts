import { Component, OnInit } from "@angular/core";
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { ApiService } from "src/app/shared/api.service";
import { URLConstant } from "src/app/apisURL/url";

@Component({
  selector: "app-treatment-cities",
  templateUrl: "./treatment-cities.component.html",
  styleUrls: ["./treatment-cities.component.scss"],
})
export class TreatmentCitiesComponent implements OnInit {
  surgeryList: any[] = [];
  selectedSurgeryId: string = "";
  selectedSurgeryTitle: string = "";
  cityMappings: any[] = [];
  showForm = false;
  editingId: string | null = null;
  cityForm!: UntypedFormGroup;

  constructor(
    private fb: UntypedFormBuilder,
    private apiService: ApiService,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadSurgeries();
  }

  initForm() {
    this.cityForm = this.fb.group({
      treatmentId: ["", Validators.required],
      citySlug: ["", Validators.required],
      cityName: ["", Validators.required],
      seoTitle: [""],
      seoDescription: [""],
      costRange: this.fb.group({
        min: [null],
        max: [null],
        currency: ["INR"],
      }),
      customContent: [""],
      isActive: [true],
    });
  }

  loadSurgeries() {
    this.apiService
      .GetData(URLConstant.masterSurgerylist, {})
      .subscribe({
        next: (res: any) => {
          this.surgeryList = res.result?.data || [];
        },
      });
  }

  onSelectSurgery(surgery: any) {
    this.selectedSurgeryId = surgery._id;
    this.selectedSurgeryTitle = surgery.title;
    this.loadCityMappings();
  }

  loadCityMappings() {
    if (!this.selectedSurgeryId) return;
    this.apiService
      .GetData(`${URLConstant.treatmentCities}/${this.selectedSurgeryId}`, {})
      .subscribe({
        next: (res: any) => {
          this.cityMappings = res.result || [];
        },
      });
  }

  onAddCity() {
    this.showForm = true;
    this.editingId = null;
    this.cityForm.reset({
      treatmentId: this.selectedSurgeryId,
      isActive: true,
      costRange: { min: null, max: null, currency: "INR" },
    });
  }

  onEditCity(mapping: any) {
    this.showForm = true;
    this.editingId = mapping._id;
    this.cityForm.patchValue({
      treatmentId: mapping.treatmentId,
      citySlug: mapping.citySlug,
      cityName: mapping.cityName,
      seoTitle: mapping.seoTitle || "",
      seoDescription: mapping.seoDescription || "",
      costRange: mapping.costRange || { min: null, max: null, currency: "INR" },
      customContent: mapping.customContent || "",
      isActive: mapping.isActive,
    });
  }

  onSaveCity() {
    if (this.cityForm.invalid) {
      this.cityForm.markAllAsTouched();
      return;
    }

    const payload = this.cityForm.value;

    if (this.editingId) {
      this.apiService
        .PutData(`${URLConstant.treatmentCity}/${this.editingId}`, payload, {})
        .subscribe({
          next: () => {
            this.toastr.success("City mapping updated");
            this.showForm = false;
            this.loadCityMappings();
          },
          error: (err: any) => this.toastr.error(err.message),
        });
    } else {
      this.apiService
        .Postdata(URLConstant.treatmentCity, payload, {})
        .subscribe({
          next: () => {
            this.toastr.success("City mapping created");
            this.showForm = false;
            this.loadCityMappings();
          },
          error: (err: any) => this.toastr.error(err.message),
        });
    }
  }

  onDeleteCity(id: string) {
    if (!confirm("Delete this city mapping?")) return;
    this.apiService
      .DeleteData(`${URLConstant.treatmentCity}/${id}`, {})
      .subscribe({
        next: () => {
          this.toastr.success("City mapping deleted");
          this.loadCityMappings();
        },
        error: (err: any) => this.toastr.error(err.message),
      });
  }

  onCancelForm() {
    this.showForm = false;
    this.editingId = null;
  }

  getCitySlugFromName() {
    const name = this.cityForm.get("cityName")?.value;
    if (name) {
      this.cityForm.patchValue({
        citySlug: name.toLowerCase().replace(/\s+/g, "-"),
      });
    }
  }
}

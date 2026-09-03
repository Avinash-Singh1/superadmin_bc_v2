import { Component, OnInit } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { ToastrService } from "ngx-toastr";
import { debounceTime, distinctUntilChanged } from "rxjs";
import { URLConstant } from "src/app/apisURL/url";
import { ApiService } from "src/app/shared/api.service";
import * as XLSX from "xlsx";
import { DeleteConfirmationComponent } from "src/app/dialogs/delete-confirmation/delete-confirmation.component";
import { DeleteUserService } from "src/app/services/delete-user.service";
import { PatientMedicalReportsComponent } from "src/app/dialogs/patient-medical-reports/patient-medical-reports.component";

@Component({
  selector: "app-patients-list",
  templateUrl: "./patients-list.component.html",
  styleUrls: ["./patients-list.component.scss"],
})
export class PatientsListComponent implements OnInit {
  dataSource: any;
  page = 1;
  totalLength: any = 0;
  itemsPerPage: number = 10;
  pageSizeOptions: number[] = [10, 25, 50, 100];
  search = new UntypedFormControl();
  sortBy: any = { sort: "", sortOrder: "" };
  data: any = [];
  patientForm: any;

  // Filter panel state
  showFilterPanel = false;
  filterGenderOpen = true;
  filterAgeOpen = true;
  filterBloodOpen = true;
  filterGenderValue: any = "";
  activeFilterCount = 0;

  genderOptions = [
    { label: "Male", value: 1 },
    { label: "Female", value: 2 },
  ];

  ageLimit = [
    { age: "Below 18", value: "1", selected: false },
    { age: "18-24", value: "2", selected: false },
    { age: "25-34", value: "3", selected: false },
    { age: "35-44", value: "4", selected: false },
    { age: "55-64", value: "5", selected: false },
    { age: "65 +", value: "6", selected: false },
  ];

  bloodType = [
    { bloodgroup: "A+", value: "1", selected: false },
    { bloodgroup: "B+", value: "2", selected: false },
    { bloodgroup: "A-", value: "3", selected: false },
    { bloodgroup: "B-", value: "4", selected: false },
    { bloodgroup: "O+", value: "5", selected: false },
    { bloodgroup: "O-", value: "6", selected: false },
    { bloodgroup: "AB+", value: "7", selected: false },
    { bloodgroup: "AB-", value: "8", selected: false },
  ];

  private bloodColorMap: any = {
    "A+": "#e53935", "A-": "#c62828",
    "B+": "#1e88e5", "B-": "#1565c0",
    "O+": "#43a047", "O-": "#2e7d32",
    "AB+": "#f57c00", "AB-": "#e65100",
  };

  constructor(
    private dialog: MatDialog,
    public toastr: ToastrService,
    public apiservice: ApiService,
    public deleteUserService: DeleteUserService,
    public fb: UntypedFormBuilder
  ) {}

  ngOnInit(): void {
    this.patientListForm();
    this.patientList();
    this.search.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(() => {
        this.page = 1;
        this.patientList();
      });
  }

  patientListForm() {
    this.patientForm = this.fb.group({
      gender: [""],
      age: [""],
      bloodgroup: [""],
    });
  }

  // ── Filter Panel ──
  toggleFilterPanel() {
    this.showFilterPanel = !this.showFilterPanel;
  }
  closeFilterPanel() {
    this.showFilterPanel = false;
  }
  toggleFilterSection(section: string) {
    if (section === "gender") this.filterGenderOpen = !this.filterGenderOpen;
    if (section === "age") this.filterAgeOpen = !this.filterAgeOpen;
    if (section === "bloodGroup") this.filterBloodOpen = !this.filterBloodOpen;
  }
  selectGenderFilter(val: any) {
    this.filterGenderValue = this.filterGenderValue === val ? "" : val;
  }
  toggleAgeChip(ageItem: any) {
    ageItem.selected = !ageItem.selected;
  }
  toggleBloodChip(bloodItem: any) {
    bloodItem.selected = !bloodItem.selected;
  }
  countActiveFilters() {
    let count = 0;
    if (this.filterGenderValue) count++;
    if (this.ageLimit.some((a) => a.selected)) count++;
    if (this.bloodType.some((b) => b.selected)) count++;
    this.activeFilterCount = count;
  }
  applyFilters() {
    this.page = 1;
    this.countActiveFilters();
    this.showFilterPanel = false;
    this.patientList();
  }
  clearAllFilters() {
    this.filterGenderValue = "";
    this.ageLimit.forEach((a) => (a.selected = false));
    this.bloodType.forEach((b) => (b.selected = false));
    this.activeFilterCount = 0;
  }
  resetFilters() {
    this.clearAllFilters();
    this.page = 1;
    this.patientList();
  }

  // ── Sort ──
  sortData(sort: any) {
    this.page = 1;
    switch (true) {
      case this.sortBy.sort != sort:
        this.sortBy = { sort, sortOrder: "ASC" };
        break;
      case this.sortBy.sortOrder == "DESC":
        this.sortBy = { sort: "", sortOrder: "" };
        break;
      case this.sortBy.sortOrder == "ASC":
        this.sortBy = { sort, sortOrder: "DESC" };
        break;
    }
    this.patientList();
  }

  // ── Data Fetch ──
  patientList() {
    const ageParam = this.ageLimit.filter((a) => a.selected).map((a) => a.value).join();
    const bloodParam = this.bloodType.filter((b) => b.selected).map((b) => b.value).join();
    let data: any = {
      page: this.page,
      size: this.itemsPerPage,
      gender: this.filterGenderValue,
      age: ageParam,
      bloodGroup: bloodParam,
      search: this.search.value,
    };
    let param = { ...data, ...this.sortBy };
    Object.keys(param).forEach((key) => {
      if (param[key] === null || param[key] === undefined || param[key] === "") {
        delete param[key];
      }
    });
    this.apiservice.GetData(URLConstant.patientList, param).subscribe(
      (res: any) => {
        this.dataSource = res?.result?.data;
        this.totalLength = res?.result?.count;
      },
      (error) => {
        this.toastr.error(error.message);
      }
    );
  }

  updatePageNumer(event: any) {
    this.page = event;
    this.patientList();
  }

  onItemsPerPageChange(val: number) {
    this.itemsPerPage = val;
    this.page = 1;
    this.patientList();
  }

  // ── Pagination Getters ──
  get showingFrom(): number {
    return this.totalLength ? (this.page - 1) * this.itemsPerPage + 1 : 0;
  }
  get showingTo(): number {
    return Math.min(this.page * this.itemsPerPage, this.totalLength || 0);
  }
  get totalPages(): number {
    return Math.ceil((this.totalLength || 0) / this.itemsPerPage);
  }

  // ── Export (fresh fetch) ──
  header = ["Name", "Gender", "City", "Mobile", "Email", "Age", "Blood Group", "Doctor Name", "Doctor City", "Specialization"];

  exportToCSV() {
    const ageParam = this.ageLimit.filter((a) => a.selected).map((a) => a.value).join();
    const bloodParam = this.bloodType.filter((b) => b.selected).map((b) => b.value).join();
    let param: any = {
      isExport: true,
      gender: this.filterGenderValue,
      age: ageParam,
      bloodGroup: bloodParam,
      search: this.search.value,
    };
    Object.keys(param).forEach((key) => {
      if (param[key] === null || param[key] === undefined || param[key] === "") {
        delete param[key];
      }
    });
    this.apiservice.GetData(URLConstant.patientList, param).subscribe((res: any) => {
      const result = res?.result?.data || [];
      const rows = result.map((r: any) => [
        r?.fullName || "N/A",
        r?.gender == 1 ? "Male" : r?.gender == 2 ? "Female" : "N/A",
        r?.address?.city || "N/A",
        r?.phone || "N/A",
        r?.email || "N/A",
        r?.age || "N/A",
        this.getBloodGroupLabel(r?.bloodGroup),
        r?.doctorName || "N/A",
        r?.doctorCity || "N/A",
        r?.doctorSpecialization?.join(", ") || "N/A",
      ]);
      const wsData = [this.header, ...rows];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      ws['!cols'] = this.header.map((_: string, i: number) => {
        const maxLen = Math.max(
          this.header[i].length,
          ...rows.map((row: any[]) => String(row[i] || '').length)
        );
        return { wch: Math.min(maxLen + 2, 40) };
      });
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Patients');
      XLSX.writeFile(wb, 'Patient_List.xlsx');
    });
  }

  // ── Helpers ──
  getInitials(name: string): string {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    return (parts[0]?.[0] || "").toUpperCase() + (parts[1]?.[0] || "").toUpperCase();
  }

  getBloodGroupLabel(val: any): string {
    const map: any = { 1: "A+", 2: "B+", 3: "A-", 4: "B-", 5: "O+", 6: "O-", 7: "AB+", 8: "AB-" };
    return map[val] || "N/A";
  }

  getBloodColor(label: string): string {
    return this.bloodColorMap[label] || "#999";
  }

  // ── Actions ──
  dialogRef: any;
  deletePatient(element: any, val2: any) {
    this.dialogRef = this.dialog.open(DeleteConfirmationComponent, {
      data: { id: element, text: "patient", type: "patient" },
    });
    this.dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.patientList();
    });
  }

  EditPatient(val: any, val2: any, page: any) {
    // placeholder for edit functionality
  }

  viewMedicalReports(patient: any) {
    this.dialog.open(PatientMedicalReportsComponent, {
      autoFocus: false,
      maxWidth: "760px",
      data: { patientId: patient?._id, patientName: patient?.fullName },
    });
  }
}

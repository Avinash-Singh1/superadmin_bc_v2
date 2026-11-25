import { ExportDoctorDialogComponent, ExportDoctorResult } from "src/app/dialogs/export-doctor-dialog/export-doctor-dialog.component";
import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { ToastrService } from "ngx-toastr";
import { debounceTime, distinctUntilChanged } from "rxjs";
import { URLConstant } from "src/app/apisURL/url";
import { AddNewDoctorComponent } from "src/app/dialogs/add-new-doctor/add-new-doctor.component";
import { ApiService } from "src/app/shared/api.service";
import * as XLSX from "xlsx";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { environment } from "src/environments/environment";
import slugify from "slugify";
import { DeleteConfirmationComponent } from "src/app/dialogs/delete-confirmation/delete-confirmation.component";

export interface PeriodicElement {
  name: string;
  position: string;
  weight: string;
  symbol: string;
  degree: string;
  mobile: number;
  email: string;
  date: number;
  bloodgroup: string;
}

const ELEMENT_DATA: PeriodicElement[] = [];
@Component({
    selector: "app-doctorhospitallist",
    templateUrl: "./doctorhospitallist.component.html",
    styleUrls: ["./doctorhospitallist.component.scss"],
    })
export class DoctorhospitallistComponent implements OnInit {
  baseurl = environment.BASE_URL;
  hospitalExportedHeader = [
    "Image",
    "Hospital Name",
    "Hospital Type",
    "Locality",
    "Total Doctors",
    "Mobile",
    "Joining Date",
    "Action",
  ];
  displayedColumns: string[] = [
    "position",
    "name",
    "Gender",
    "Address",
    "Mobile",
    "Email",
    "Age",
    "BloodGroup",
    "requestStatus",
    "Action",
    "Status",
  ];
  displayedHospitalColumns: string[] = [
    "position",
    "name",
    "Gender",
    "Address",
    "City",
    "Mobile",
    "Email",
    "BloodGroup",
    "requestStatus",
    "Action",
    "Status",
  ];

  fullNameASC: boolean = true;
  fullNameDESC: boolean = false;
  specialASC: boolean = true;
  specialDESC: boolean = false;
  localityASC: boolean = true;
  localityDESC: boolean = false;
  degreeASC: boolean = true;
  degreeDESC: boolean = false;
  fullhospitalNameASC: boolean = true;
  fullhospitalNameDESC: boolean = false;
  typeOfhospitalASC: boolean = true;
  typeOfhospitalDESC: boolean = false;
  localityhospitalASC: boolean = true;
  localityhospitalDESC: boolean = false;
  sortBy: any = {
    order: "",
    sortBy: "",
  };
  sortByHospital: any = {
    sortOrder: "",
    sort: "",
  };
  dataSource: any;
  dataSourceHospital: any;
  hospital: boolean = false;
  age: boolean = false;
  bloodGroup: boolean = false;
  isChecked: any = false;
  doctorsList: boolean = true;
  hospitalsList: boolean = false;
  totalLength: any;
  OccupationList: any;
  totalLengthHospital: any;
  search = new UntypedFormControl();
  toggle = new UntypedFormControl();
  getToggleEvent: boolean = true;
  getTogglehospital: boolean = true;
  itemsPerPage: number = 10;
  pageOfHospital = 1;
  cityListing: any;
  typeOfHospital: any;
  itemPerPageOfHospital = 10;
  page: any = 1;
  dialogRef: any;
  filterForm: any;
  pageSizeOptions = [10, 25, 50, 100];
  showFilterPanel = false;
  bulkStatusUpdating: boolean = false;
  filterSpecOpen = true;
  filterHospTypeOpen = true;
  filterOwnershipOpen = true;
  filterCitiesOpen = true;
  filterGenderOpen = true;
  filterFeesOpen = true;
  filterStatusOpen = true;
  filterActiveOpen = true;
  filterSourceOpen = true;

  // Rich Filter State
  genderParam: number | null = null;
  ownershipParam: string | null = null;
  minFeesParam: number | null = null;
  maxFeesParam: number | null = null;
  selectedFeePreset: string | null = null;
  approvalStatusParam: number | null = null;
  statusParam: number | null = null;
  signupSourceParam: string | null = null;

  specSearchText: string = "";
  citySearchText: string = "";

  feePresets = [
    { label: "Free (₹0)", min: 0, max: 0 },
    { label: "₹1 - ₹500", min: 1, max: 500 },
    { label: "₹501 - ₹1,000", min: 501, max: 1000 },
    { label: "₹1,001 - ₹2,000", min: 1001, max: 2000 },
    { label: "₹2,000+", min: 2001, max: null },
  ];

  signupSources = ["Android App", "Web App", "Admin Portal"];

  specialization = [
    "Dental",
    "Orthopaedics",
    "General Surgery",
    "ENT",
    "Obstetrics/Gynaecology",
  ];
  cities = [
    "Delhi",
    "Ghaziabad",
    "Noida",
    "Bangalore",
    "Gurugram",
    "Mumbai",
    "Nagpur",
    "Kolkata",
    "Chennai",
    "Pune",
    "Hyderabad",
    "Ahmedabad",
    "Jaipur",
    "Lucknow",
    "Chandigarh",
    "Indore",
    "Bhopal",
  ];
  hospitals = [
    "Clinic",
    "Super-speciality",
    "Multi-speciality",
    "Super-speciality Clinic",
    "Multi-speciality Clinic",
  ];

  data: any = [];

  constructor(
    private dialog: MatDialog,
    private apiservice: ApiService,
    private toastr: ToastrService,
    private fb: UntypedFormBuilder,
    private loader: NgxUiLoaderService
  ) {}

  ngOnInit(): void {
    this.filterGroup();
    this.doctorList("", "");
    this.hospitalList("");
    this.specializationList();
    this.typeOfHospitalList();
    this.getCityList();
    this.getSampleArr();
    this.getSampleHospitalArr();
    this.search.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((val) => {
        if (this.doctorsList) {
          this.searchFunction(val);
        } else if (this.hospitalsList) {
          this.searchHospitalFunction(val);
        }
      });
  }

  filterGroup() {
    this.filterForm = this.fb.group({
      specialization: [""],
      typeOfHospital: [""],
      cities: [""],
    });
  }
  changeGender(type: any) {
    if (type == "hospital") {
      this.hospital = !this.hospital;
    } else if (type == "age") {
      this.age = !this.age;
    } else if (type == "bloodGroup") {
      this.bloodGroup = !this.bloodGroup;
    }
  }

  get activeFilterCount(): number {
    let count = 0;
    if (this.specializationParam?.length) count += this.specializationParam.length;
    if (this.hospitalParam?.length) count += this.hospitalParam.length;
    if (this.hospitalsList && this.ownershipParam !== null) count += 1;
    if (this.citiesParam?.length) count += this.citiesParam.length;
    if (this.genderParam !== null) count += 1;
    if (this.minFeesParam !== null || this.maxFeesParam !== null) count += 1;
    if (this.approvalStatusParam !== null) count += 1;
    if (this.statusParam !== null) count += 1;
    if (this.signupSourceParam !== null) count += 1;
    return count;
  }

  get activeFilters(): Array<{ type: string; label: string; value: any }> {
    const list: Array<{ type: string; label: string; value: any }> = [];
    if (this.doctorsList && this.specializationParam?.length) {
      this.specializationParam.forEach((id: any) => {
        const item = this.OccupationList?.find((o: any) => o._id === id);
        if (item) list.push({ type: 'spec', label: `Spec: ${item.name}`, value: id });
      });
    }
    if (this.hospitalsList && this.hospitalParam?.length) {
      this.hospitalParam.forEach((id: any) => {
        const item = this.typeOfHospital?.find((h: any) => h._id === id);
        if (item) list.push({ type: 'hospitalType', label: `Type: ${item.name}`, value: id });
      });
    }
    if (this.hospitalsList && this.ownershipParam !== null) {
      const ownLabel =
        this.ownershipParam === 'own'
          ? 'Own Hospital'
          : this.ownershipParam === 'visit'
          ? 'Visit Hospital'
          : 'Standalone Hospital';
      list.push({ type: 'ownership', label: `Category: ${ownLabel}`, value: this.ownershipParam });
    }
    if (this.citiesParam?.length) {
      this.citiesParam.forEach((city: string) => {
        list.push({ type: 'city', label: `City: ${city}`, value: city });
      });
    }
    if (this.doctorsList && this.genderParam !== null) {
      const gLabel = this.genderParam === 1 ? 'Male' : this.genderParam === 2 ? 'Female' : 'Other';
      list.push({ type: 'gender', label: `Gender: ${gLabel}`, value: this.genderParam });
    }
    if (this.doctorsList && (this.minFeesParam !== null || this.maxFeesParam !== null)) {
      let feeLabel = 'Fees: ';
      if (this.selectedFeePreset) {
        feeLabel += this.selectedFeePreset;
      } else if (this.minFeesParam !== null && this.maxFeesParam !== null) {
        feeLabel += `₹${this.minFeesParam} - ₹${this.maxFeesParam}`;
      } else if (this.minFeesParam !== null) {
        feeLabel += `₹${this.minFeesParam}+`;
      } else if (this.maxFeesParam !== null) {
        feeLabel += `Up to ₹${this.maxFeesParam}`;
      }
      list.push({ type: 'fees', label: feeLabel, value: null });
    }
    if (this.approvalStatusParam !== null) {
      const statusLabel =
        this.approvalStatusParam === 1
          ? 'Pending'
          : this.approvalStatusParam === 2
          ? 'Approved'
          : 'Rejected';
      list.push({ type: 'approvalStatus', label: `Status: ${statusLabel}`, value: this.approvalStatusParam });
    }
    if (this.statusParam !== null) {
      const activeLabel = this.statusParam === 2 ? 'Active' : 'Inactive';
      list.push({ type: 'status', label: `Account: ${activeLabel}`, value: this.statusParam });
    }
    if (this.doctorsList && this.signupSourceParam !== null) {
      list.push({ type: 'signupSource', label: `Source: ${this.signupSourceParam}`, value: this.signupSourceParam });
    }
    return list;
  }

  get filteredSpecializations(): any[] {
    if (!this.OccupationList) return [];
    if (!this.specSearchText?.trim()) return this.OccupationList;
    const term = this.specSearchText.trim().toLowerCase();
    return this.OccupationList.filter((s: any) => s?.name?.toLowerCase().includes(term));
  }

  get filteredCities(): string[] {
    if (!this.cities) return [];
    if (!this.citySearchText?.trim()) return this.cities;
    const term = this.citySearchText.trim().toLowerCase();
    return this.cities.filter((c: string) => c?.toLowerCase().includes(term));
  }

  get doctorShowingFrom(): number {
    if (!this.totalLength) return 0;
    return (this.page - 1) * this.itemsPerPage + 1;
  }
  get doctorShowingTo(): number {
    return Math.min(this.page * this.itemsPerPage, this.totalLength || 0);
  }
  get hospitalShowingFrom(): number {
    if (!this.totalLengthHospital) return 0;
    return (this.pageOfHospital - 1) * this.itemPerPageOfHospital + 1;
  }
  get hospitalShowingTo(): number {
    return Math.min(this.pageOfHospital * this.itemPerPageOfHospital, this.totalLengthHospital || 0);
  }

  getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0].substring(0, 2).toUpperCase();
  }

  toggleFilterPanel() { this.showFilterPanel = !this.showFilterPanel; }
  closeFilterPanel() { this.showFilterPanel = false; }
  toggleFilterSection(section: string) {
    if (section === 'specialization') this.filterSpecOpen = !this.filterSpecOpen;
    else if (section === 'hospitalType') this.filterHospTypeOpen = !this.filterHospTypeOpen;
    else if (section === 'ownership') this.filterOwnershipOpen = !this.filterOwnershipOpen;
    else if (section === 'cities') this.filterCitiesOpen = !this.filterCitiesOpen;
    else if (section === 'gender') this.filterGenderOpen = !this.filterGenderOpen;
    else if (section === 'fees') this.filterFeesOpen = !this.filterFeesOpen;
    else if (section === 'status') this.filterStatusOpen = !this.filterStatusOpen;
    else if (section === 'accountStatus') this.filterActiveOpen = !this.filterActiveOpen;
    else if (section === 'source') this.filterSourceOpen = !this.filterSourceOpen;
  }

  selectGender(gender: number | null) {
    this.genderParam = this.genderParam === gender ? null : gender;
  }

  selectOwnership(type: string | null) {
    this.ownershipParam = this.ownershipParam === type ? null : type;
  }

  setOwnershipQuickFilter(type: string | null) {
    this.ownershipParam = type;
    this.pageOfHospital = 1;
    this.hospitalList('');
  }

  selectFeePreset(preset: any) {
    if (this.selectedFeePreset === preset.label) {
      this.selectedFeePreset = null;
      this.minFeesParam = null;
      this.maxFeesParam = null;
    } else {
      this.selectedFeePreset = preset.label;
      this.minFeesParam = preset.min;
      this.maxFeesParam = preset.max;
    }
  }

  onCustomFeeMinChange(val: any) {
    this.selectedFeePreset = null;
    this.minFeesParam = val !== '' && val !== null ? Number(val) : null;
  }

  onCustomFeeMaxChange(val: any) {
    this.selectedFeePreset = null;
    this.maxFeesParam = val !== '' && val !== null ? Number(val) : null;
  }

  selectApprovalStatus(status: number | null) {
    this.approvalStatusParam = this.approvalStatusParam === status ? null : status;
  }

  selectAccountStatus(status: number | null) {
    this.statusParam = this.statusParam === status ? null : status;
  }

  selectSignupSource(src: string | null) {
    this.signupSourceParam = this.signupSourceParam === src ? null : src;
  }

  removeFilter(filter: any) {
    if (filter.type === 'spec') {
      const item = this.OccupationList?.find((o: any) => o._id === filter.value);
      if (item) item.selected = false;
      this.specializationParam = this.specializationParam.filter((id: any) => id !== filter.value);
    } else if (filter.type === 'hospitalType') {
      const item = this.typeOfHospital?.find((h: any) => h._id === filter.value);
      if (item) item.selected = false;
      this.hospitalParam = this.hospitalParam.filter((id: any) => id !== filter.value);
    } else if (filter.type === 'ownership') {
      this.ownershipParam = null;
    } else if (filter.type === 'city') {
      this.citiesParam = this.citiesParam.filter((c: string) => c !== filter.value);
    } else if (filter.type === 'gender') {
      this.genderParam = null;
    } else if (filter.type === 'fees') {
      this.minFeesParam = null;
      this.maxFeesParam = null;
      this.selectedFeePreset = null;
    } else if (filter.type === 'approvalStatus') {
      this.approvalStatusParam = null;
    } else if (filter.type === 'status') {
      this.statusParam = null;
    } else if (filter.type === 'signupSource') {
      this.signupSourceParam = null;
    }
    this.applyFilters();
  }

  toggleSpecChip(spec: any) {
    spec.selected = !spec.selected;
    if (spec.selected) {
      this.specializationParam.push(spec._id);
    } else {
      this.specializationParam = this.specializationParam.filter((id: any) => id !== spec._id);
    }
  }
  toggleHospTypeChip(ht: any) {
    ht.selected = !ht.selected;
    if (ht.selected) {
      this.hospitalParam.push(ht._id);
    } else {
      this.hospitalParam = this.hospitalParam.filter((id: any) => id !== ht._id);
    }
  }
  isCitySelected(city: string): boolean { return this.citiesParam.includes(city); }
  toggleCityChip(city: string) {
    if (this.citiesParam.includes(city)) {
      this.citiesParam = this.citiesParam.filter((c: any) => c !== city);
    } else {
      this.citiesParam.push(city);
    }
  }
  applyFilters() {
    this.showFilterPanel = false;
    if (this.doctorsList) { this.page = 1; this.doctorList('', ''); }
    else { this.pageOfHospital = 1; this.hospitalList(''); }
  }
  clearAllFilters() {
    this.specializationParam = [];
    this.hospitalParam = [];
    this.citiesParam = [];
    this.genderParam = null;
    this.minFeesParam = null;
    this.maxFeesParam = null;
    this.selectedFeePreset = null;
    this.approvalStatusParam = null;
    this.statusParam = null;
    this.signupSourceParam = null;
    this.ownershipParam = null;
    this.specSearchText = "";
    this.citySearchText = "";
    if (this.OccupationList) this.OccupationList.forEach((s: any) => (s.selected = false));
    if (this.typeOfHospital) this.typeOfHospital.forEach((h: any) => (h.selected = false));
  }
  resetAllFilters() {
    this.clearAllFilters();
    this.applyFilters();
  }
  onDoctorPageSizeChange(size: number) {
    this.itemsPerPage = size;
    this.page = 1;
    this.doctorList('', '');
  }
  onHospitalPageSizeChange(size: number) {
    this.itemPerPageOfHospital = size;
    this.pageOfHospital = 1;
    this.hospitalList('');
  }

  chnageDoctorList(list: any) {
    if (list == "doctors") {
      this.doctorsList = true;
      this.hospitalsList = false;
      this.search.reset();
      this.filterForm.reset();
      this.clearAllFilters();
      this.doctorList("", "");
    } else if (list == "hospitals") {
      this.hospitalsList = true;
      this.doctorsList = false;
      this.search.reset();
      this.filterForm.reset();
      this.clearAllFilters();
      this.hospitalList("");
    }
  }
  toggleCheckboxdoctors(event: any, id: any) {
    this.getToggleEvent = event.target.checked;
    let index = this.dataSource.findIndex((el: any) => el.userId == id);
    if (index >= 0) {
      this.dataSource[index].status = this.getToggleEvent == true ? 1 : 0;
    }
  }
  toggleCheckboxhospitalss(event: any, id: any) {
    this.getTogglehospital = event.target.checked;
    let index = this.dataSourceHospital.findIndex((el: any) => el._id == id);
    if (index >= 0) {
      this.dataSourceHospital[index].status =
        this.getTogglehospital == true ? 2 : 5;
    }
  }

  addDoctor(data: any, id: any, page: any) {
    this.dialogRef = this.dialog.open(AddNewDoctorComponent, {
      height: "750px",
      width: "720px",
      panelClass: "yespost",
      data: {
        data: data,
        id: id,
        page: page,
        doctorlist: this.doctorsList ? true : false,
        hospitallist: this.hospitalsList ? true : false,
      },
    });
    this.dialogRef.afterClosed().subscribe((data: any) => {
      if (data == true) {
        this.doctorList("", "");
        this.hospitalList("");
      }
    });
  }

  deleteDoctor(id: string, type: string, establishmentId?: string) {
    // When deleting from hospital list, we're actually deleting the establishment
    // not the entire user account, unless explicitly specified
    const actualType = type === "hospital" && establishmentId ? "establishment" : type;
    const actualId = type === "hospital" && establishmentId ? establishmentId : id;
    
    this.dialogRef = this.dialog.open(DeleteConfirmationComponent, {
      data: {
        id: actualId,
        text: actualType === "establishment" ? "Establishment" : type === "doctor" ? "Doctor" : "Hospital",
        type: actualType,
      },
    });

    this.dialogRef.afterClosed().subscribe((data: boolean) => {
      if (!data) return;

      if (type === "doctor") return this.doctorList("", "");

      this.hospitalList("");
    });
  }

  specializationParam: any = [];
  citiesParam: any = [];
  hospitalParam: any = [];
  specilaizationCitiesFilter(event: any, value: any) {
    if (value == "specialization" && event?.checked == true) {
      let index = this.OccupationList.findIndex(
        (el: any) => el?._id == event?.source?.value
      );
      this.OccupationList[index].selected = true;
      this.specializationParam.push(event.source?.value);
    } else if (value == "specialization" && event?.checked == false) {
      let index = this.OccupationList.findIndex(
        (el: any) => el?._id == event?.source?.value
      );
      this.OccupationList[index].selected = false;
      this.specializationParam.findIndex((ele: any) => {
        if (ele === event.source.value) {
          let ages = this.specializationParam.indexOf(ele);
          this.specializationParam.splice(ages, 1);
        }
      });
    }

    if (value == "cities" && event?.checked == true) {
      this.citiesParam.push(event.source?.value);
    } else if (value == "cities" && event?.checked == false) {
      this.citiesParam.findIndex((ele: any) => {
        if (ele === event.source.value) {
          let bloods = this.citiesParam.indexOf(ele);
          this.citiesParam.splice(bloods, 1);
        }
      });
    }

    if (value == "hospital" && event?.checked == true) {
      let index = this.typeOfHospital.findIndex(
        (el: any) => el?._id == event?.source?.value
      );
      this.typeOfHospital[index].selected = true;
      this.hospitalParam.push(event.source?.value);
    } else if (value == "hospital" && event?.checked == false) {
      let index = this.typeOfHospital.findIndex(
        (el: any) => el?._id == event?.source?.value
      );
      this.typeOfHospital[index].selected = false;
      this.hospitalParam.findIndex((ele: any) => {
        if (ele === event.source.value) {
          let bloods = this.hospitalParam.indexOf(ele);
          this.hospitalParam.splice(bloods, 1);
        }
      });
    }
  }

  getLength: any;
  doctorList(event: any, value: any) {
    let param: any = {
      page: this.page,
      size: this.itemsPerPage,
      specialization: this.specializationParam.join(),
      cities: this.citiesParam.join(),
      search: this.search.value,
      gender: this.genderParam,
      minFees: this.minFeesParam,
      maxFees: this.maxFeesParam,
      approvalStatus: this.approvalStatusParam,
      status: this.statusParam,
      signupSource: this.signupSourceParam,
    };
    let data = { ...param, ...this.sortBy };
    Object.keys(data).forEach((key) => {
      if (data[key] === null || data[key] === undefined || data[key] === "") {
        delete data[key];
      }
    });

    this.apiservice.GetData(URLConstant.doctorList, data).subscribe(
      (res: any) => {
        this.dataSource = res?.result?.[0]?.data || [];
        this.getLength = res?.result?.[0]?.totalCount;
        this.totalLength = res?.result?.[0]?.totalCount?.[0]?.count || 0;
        for (let i = 0; i < this.dataSource.length; i++) {
          this.dataSource[i]["name"] =
            this.dataSource[i]?.doctorDetails?.fullName?.split(" ");
        }
      },
      (error) => {
        this.toastr.error(error?.message || 'Failed to load doctors');
      }
    );
  }
  hospitalList(event: any) {
    let data: any = {
      page: this.pageOfHospital,
      size: this.itemPerPageOfHospital,
      hospitalType: this.hospitalParam.join(),
      city: this.citiesParam.join(),
      search: this.search.value,
      approvalStatus: this.approvalStatusParam,
      status: this.statusParam,
      ownershipType: this.ownershipParam,
    };
    let param = { ...data, ...this.sortByHospital };

    Object.keys(param).forEach((key) => {
      if (
        param[key] === null ||
        param[key] === undefined ||
        param[key] === ""
      ) {
        delete param[key];
      }
    });
    this.apiservice.GetData(URLConstant.hospitalList, param).subscribe(
      (res: any) => {
        this.dataSourceHospital = res?.result?.data || [];
        this.totalLengthHospital = res?.result?.count || 0;
        for (let i = 0; i < this.dataSourceHospital.length; i++) {
          this.dataSourceHospital[i]["name"] =
            this.dataSourceHospital[i]?.hospitalName?.split(" ");
        }
      },
      (error) => {
        this.toastr.error(error?.message || 'Failed to load hospitals');
      }
    );
  }
  searchFunction(value: any) {
    this.page = 1;
    this.doctorList(value, "");
  }
  updatePageNumer(event: any) {
    this.page = event;
    this.doctorList("", "");
  }
  searchHospitalFunction(value: any) {
    this.pageOfHospital = 1;
    this.hospitalList(value);
  }
  updateHospitalPageNumer(event: any) {
    this.pageOfHospital = event;
    this.hospitalList("");
  }
  specializationList() {
    this.apiservice
      .GetData(URLConstant.specialization, "")
      .subscribe((res: any) => {
        this.OccupationList = res?.result?.data;
        this.OccupationList.forEach((res: any) => {
          res["selected"] = false;
        });
      });
  }

  typeOfHospitalList() {
    this.apiservice
      .GetData(URLConstant.masterData, "")
      .subscribe((res: any) => {
        this.typeOfHospital = res?.result?.data;
        this.typeOfHospital.forEach((res: any) => {
          res["selected"] = false;
        });
      });
  }

  getCityList() {
    this.apiservice
      .GetData(URLConstant.cityList, "")
      .subscribe(
        (res: any) => {
          const list = Array.isArray(res?.result?.data)
            ? res.result.data
            : Array.isArray(res?.result)
            ? res.result
            : Array.isArray(res?.data)
            ? res.data
            : [];
          if (list.length > 0) {
            const fetched = list
              .map((c: any) => (typeof c === "string" ? c : c?.name)?.trim())
              .filter((n: any) => Boolean(n));
            if (fetched.length > 0) {
              const combined = Array.from(new Set([...this.cities, ...fetched]));
              this.cities = combined.sort((a, b) => a.localeCompare(b));
            }
          }
        },
        () => {
          // Use current default list
        }
      );
  }

  //sort data

  sortData(sortBy: any) {
    if (this.doctorsList) {
      this.page = 1;
      switch (true) {
        case this.sortBy.sortBy != sortBy:
          this.sortBy = {
            sortBy,
            order: "ASC",
          };
          break;
        case this.sortBy.order == "DESC":
          this.sortBy = {
            sortBy: "",
            order: "",
          };
          break;
        case this.sortBy.order == "ASC":
          this.sortBy = {
            sortBy,
            order: "DESC",
          };
          break;
      }
      this.doctorList("", "");
    } else if (this.hospitalsList) {
      this.pageOfHospital = 1;
      switch (true) {
        case this.sortByHospital.sort != sortBy:
          this.sortByHospital = {
            sort: sortBy,
            sortOrder: "ASC",
          };
          break;
        case this.sortByHospital.sortOrder == "DESC":
          this.sortByHospital = {
            sort: "",
            sortOrder: "",
          };
          break;
        case this.sortByHospital.sortOrder == "ASC":
          this.sortByHospital = {
            sort: sortBy,
            sortOrder: "DESC",
          };
          break;
      }
      this.hospitalList("");
    }
  }
  result: any;

  openExportDoctorDialog(): void {
    const dialogRef = this.dialog.open(ExportDoctorDialogComponent, {
      width: "540px",
      panelClass: "custom-export-dialog",
      data: {},
    });

    dialogRef.afterClosed().subscribe((result: ExportDoctorResult | null) => {
      if (result) {
        this.streamExportDoctors(result);
      }
    });
  }

  streamExportDoctors(options: ExportDoctorResult): void {
    this.loader.start();
    this.toastr.info("Preparing your doctors CSV export...", "Export Started");

    const params: any = {
      exportType: options.exportType,
      specialization: this.specializationParam?.length ? this.specializationParam.join() : undefined,
      cities: this.citiesParam?.length ? this.citiesParam.join() : undefined,
      search: this.search?.value || undefined,
      gender: this.genderParam || undefined,
      minFees: this.minFeesParam || undefined,
      maxFees: this.maxFeesParam || undefined,
      approvalStatus: this.approvalStatusParam !== undefined && this.approvalStatusParam !== null ? this.approvalStatusParam : undefined,
      status: this.statusParam !== undefined && this.statusParam !== null ? this.statusParam : undefined,
      signupSource: this.signupSourceParam || undefined,
    };

    if (options.exportType === "dateRange") {
      params.startDate = options.startDate;
      params.endDate = options.endDate;
    }

    // Clean undefined/null/empty keys
    Object.keys(params).forEach((key) => {
      if (params[key] === null || params[key] === undefined || params[key] === "") {
        delete params[key];
      }
    });

    this.apiservice.DownloadBlob(URLConstant.exportDoctors, params).subscribe({
      next: (blob: any) => {
        this.loader.stop();
        if (!blob || blob.size === 0) {
          this.toastr.warning("No doctors found for the selected criteria.", "Export Empty");
          return;
        }

        const filename =
          options.exportType === "dateRange" && options.startDate && options.endDate
            ? `Doctors_Export_${options.startDate}_to_${options.endDate}.csv`
            : `Doctors_Export_All_${new Date().toISOString().slice(0, 10)}.csv`;

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        this.toastr.success("Doctors CSV exported successfully!", "Success");
      },
      error: (err: any) => {
        this.loader.stop();
        console.error("Export error:", err);
        this.toastr.error("Failed to export doctors. Please try again.", "Export Failed");
      },
    });
  }

  downloadDoctorList(param?: any) {
    this.data = [];
    this.result = "";
    let data: any = {
      isExport: true,
      specialization: this.specializationParam.join(),
      cities: this.citiesParam.join(),
      search: this.search.value,
      gender: this.genderParam,
      minFees: this.minFeesParam,
      maxFees: this.maxFeesParam,
      approvalStatus: this.approvalStatusParam,
      status: this.statusParam,
      signupSource: this.signupSourceParam,
    };
    Object.keys(data).forEach((key) => {
      if (data[key] === null || data[key] === undefined || data[key] === "") {
        delete data[key];
      }
    });
    this.apiservice
      .GetData(URLConstant.doctorList, data)
      .subscribe((res: any) => {
        if (res?.success) {
          this.result = res?.result?.[0]?.data || [];
          for (let i = 0; i < this.result.length; i++) {
            this.data.push([
              this.result[i]?.profilePic,
              this.result[i]?.doctorDetails?.fullName,
              this.result[i]?.specialization?.[0]?.name,
              this.result[i]?.city || "N/A",
              this.result[i]?.education?.[0]?.degree,
              this.result[i]?.doctorDetails?.phone,
              this.result[i]?.email,
              this.extractProofUrls(this.result[i]?.medicalProof) || "N/A",
              this.extractProofUrls(this.result[i]?.identityProof) || "N/A",
              this.result[i]?.signupSource || "Web App",
              this.result[i]?.createdAt,
            ]);
          }
          if (param) this.exportToCSV();
        }
      });
  }
  hospitalExport: any;
  hospitalExporteddata: any = [];
  downloadHospitalList(param?: any) {
    this.hospitalExporteddata = [];
    this.hospitalExport = "";
    let data: any = {
      isExport: true,
      hospitalType: this.hospitalParam.join(),
      city: this.citiesParam.join(),
      search: this.search.value,
      approvalStatus: this.approvalStatusParam,
      status: this.statusParam,
      ownershipType: this.ownershipParam,
    };
    Object.keys(data).forEach((key) => {
      if (data[key] === null || data[key] === undefined || data[key] === "") {
        delete data[key];
      }
    });
    this.apiservice
      .GetData(URLConstant.hospitalList, data)
      .subscribe((res: any) => {
        this.hospitalExport = res?.result?.data || [];
        for (let i = 0; i < this.hospitalExport.length; i++) {
          this.hospitalExporteddata.push([
            this.hospitalExport[i]?.profilePic
              ? this.hospitalExport[i]?.profilePic
              : "N/A",
            this.hospitalExport[i]?.hospitalName
              ? this.hospitalExport[i]?.hospitalName
              : "N/A",
            this.hospitalExport[i]?.hospitalType
              ? this.hospitalExport[i]?.hospitalType
              : "N/A",
            this.hospitalExport[i]?.locality
              ? this.hospitalExport[i]?.locality
              : "N/A",
            this.hospitalExport[i]?.totalDoctors
              ? this.hospitalExport[i]?.totalDoctors
              : "N/A",
            this.hospitalExport[i]?.phone
              ? this.hospitalExport[i]?.phone
              : "N/A",
            this.hospitalExport[i]?.joiningDate
              ? this.hospitalExport[i]?.joiningDate
              : "N/A",
            this.hospitalExport[i]?.status == 2 ? "Active" : "Inactive",
          ]);
        }
        if (param) {
          this.exportHospitalToCSV();
        }
      });
  }
  header = [
    "Image",
    "Name",
    "Specialisation",
    "Locality",
    "Degree",
    "Mobile",
    "Email",
    "Medical Proof",
    "Identity Proof URL",
    "Source",
    "Joining Date",
  ];

  extractProofUrls(proof: any): string {
    if (!proof) return "";
    if (typeof proof === "string") return proof;
    if (Array.isArray(proof)) {
      return proof
        .map((p: any) => {
          if (!p) return "";
          if (typeof p === "string") return p.trim();
          return (p.url || "").trim();
        })
        .filter((url: string) => !!url)
        .join(", ");
    }
    if (typeof proof === "object" && proof.url) {
      return String(proof.url).trim();
    }
    return "";
  }

  activeInactiveHospital(status: any, id: any) {
    let param = {
      userId: id,
    };
    this.apiservice
      .DeleteData(URLConstant.deleteHospital, param)
      .subscribe(
        (res: any) => {
          this.toastr.success('Hospital has been marked for deletion');
          this.hospitalList('');
        },
        (error: any) => {
          this.toastr.error(error?.message || 'Failed to update hospital status');
        }
      );
  }

  toggleMedicalVerificationEdit(element: any) {
    const targetStatus = !element?.isMedicalVerificationEditable;
    const doctorId = element?.userId || element?._id;
    if (!doctorId) {
      this.toastr.error("Doctor ID not found.");
      return;
    }
    const param = { doctorId };
    const data = { isMedicalVerificationEditable: targetStatus };

    this.apiservice
      .patchData(URLConstant.toggleMedicalVerificationEdit, data, param)
      .subscribe({
        next: (res: any) => {
          element.isMedicalVerificationEditable = targetStatus;
          const docName = element?.doctorDetails?.fullName || "Doctor";
          if (targetStatus) {
            this.toastr.success(`Medical verification editing enabled for ${docName}.`);
          } else {
            this.toastr.info(`Medical verification editing locked for ${docName}.`);
          }
        },
        error: (err: any) => {
          console.error("Error toggling medical verification edit permission:", err);
          this.toastr.error("Failed to update medical verification edit permission.");
        },
      });
  }

  updateDoctorsBySpecialization(status: 2 | 5): void {
    if (!this.specializationParam.length || this.bulkStatusUpdating) return;

    const action = status === 2 ? "activate" : "deactivate";
    const specializationNames = (this.OccupationList || [])
      .filter((specialization: any) => this.specializationParam.includes(specialization._id))
      .map((specialization: any) => specialization.name)
      .join(", ");

    if (!window.confirm(`Are you sure you want to ${action} all doctors in: ${specializationNames}?`)) {
      return;
    }

    this.bulkStatusUpdating = true;
    this.loader.start();
    this.apiservice
      .patchData(URLConstant.bulkActiveInactiveDoctors, {
        isVerified: status,
        specializationIds: this.specializationParam,
      }, {})
      .subscribe({
        next: (res: any) => {
          const result = res?.result?.data || {};
          this.toastr.success(`${result.updated || 0} doctors ${action}d; ${result.unchanged || 0} already unchanged.`);
          this.doctorList("", "");
          this.loader.stop();
          this.bulkStatusUpdating = false;
        },
        error: (error: any) => {
          this.toastr.error(error?.message || `Unable to ${action} doctors.`);
          this.loader.stop();
          this.bulkStatusUpdating = false;
        },
      });
  }

  activeInactiveDoctor(status: any, id: any) {
    let param = {
      doctorId: id,
    };
    let data = {
      isVerified:
        status == 2
          ? 5
          : status == 5
          ? 2
          : status == 4
          ? 2
          : status == 3
          ? 2
          : status == 1
          ? 2
          : 5,
    };
    this.apiservice
      .patchData(URLConstant.activeInactiveDoctor, data, param)
      .subscribe((res: any) => {
        this.doctorList("", "");
      });
  }

  exportToCSV() {
    const aoa = [this.header, ...this.data];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws['!cols'] = this.header.map(() => ({ wch: 20 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Doctors');
    XLSX.writeFile(wb, 'Doctor_List.xlsx');
  }

  sampleCSVDoctorData = [
    {
      name: "Saumya",
      phone: "7388383838",
      specialization: "ENT",
      Gender: "Male",
      RegistrationNumber: 2,
      RegistrationCouncil: "Delhi",
      Degree: "MBBS",
      College: "RATM",
      yearOfCompletion: 2010,
      Experience: 12,
      Owner: "NO",
      EstablishmentName: "Pragya Hospital",
      HospitalType: "Clinic",
      Street: "Plot No. A-2, Chirag Enclave",
      Locality: "Greater Kailash Part 1",
      City: "Delhi",
      State: "Delhi",
      Pincode: "201301",
      Country: "India",
    },
    {
      name: "Veer",
      phone: "7388383848",
      specialization: "Dental",
      Gender: "Male",
      RegistrationNumber: 2,
      RegistrationCouncil: "Delhi",
      Degree: "MS",
      College: "RATM",
      yearOfCompletion: 2022,
      Experience: 1,
      Owner: "NO",
      EstablishmentName: "Pragti Hospital",
      HospitalType: "Clinic",
      Street: "Plot No. A-2, Chirag Enclave",
      Locality: "Greater Kailash Part 1",
      City: "Delhi",
      State: "Delhi",
      Pincode: "201301",
      Country: "India",
    },
    {
      name: "Saumya Sarkar",
      phone: "7388383828",
      specialization: "ENT",
      Gender: "Male",
      RegistrationNumber: 2,
      RegistrationCouncil: "Delhi",
      Degree: "MBBS",
      College: "RATM",
      yearOfCompletion: 2022,
      Experience: 12,
      Owner: "NO",
      EstablishmentName: "Pragya Hospital",
      HospitalType: "Clinic",
      Street: "Plot No. A-2, Chirag Enclave",
      Locality: "Greater Kailash Part 1",
      City: "Delhi",
      State: "Delhi",
      Pincode: "201301",
      Country: "India",
    },
    {
      name: "Abhinav",
      phone: "7388383938",
      specialization: "Pathologist",
      Gender: "Male",
      RegistrationNumber: 2,
      RegistrationCouncil: "Delhi",
      Degree: "MBBS",
      College: "RATM",
      yearOfCompletion: 2022,
      Experience: 12,
      Owner: "NO",
      EstablishmentName: "Pragya Hospital",
      HospitalType: "Clinic",
      Street: "Plot No. A-2, Chirag Enclave",
      Locality: "Greater Kailash Part 1",
      City: "Delhi",
      State: "Delhi",
      Pincode: "201301",
      Country: "India",
    },
  ];
  sampleCSVHospitalData = [
    {
      hospitalType: "Clinic",
      name: "Nakul",
      street: "Jawahar Road",
      locality: "Baldeo",
      City: "Mathura",
      phone: "7386748847",
      state: "UP",
      pincode: 281301,
      country: "India",
    },
    {
      hospitalType: "Hospital",
      name: "Kamlesh",
      street: "Nivri Road",
      locality: "Baldeo",
      City: "Mathura",
      phone: "7386748847",
      state: "UP",
      pincode: 281301,
      country: "India",
    },
    {
      hospitalType: "Clinic",
      name: "Hitesh Pathak",
      street: "Holi Gate",
      locality: "Mathura",
      City: "Mathura",
      phone: "7386748847",
      state: "UP",
      pincode: 281301,
      country: "India",
    },
    {
      hospitalType: "Hospital",
      name: "Nakul",
      street: "Jawahar Road",
      locality: "Baldeo",
      City: "Mathura",
      phone: "7386748847",
      state: "UP",
      pincode: 281301,
      country: "India",
    },
  ];
  SampleDataArr: any = [];
  getSampleArr() {
    for (let i = 0; i < this.sampleCSVDoctorData.length; i++) {
      this.SampleDataArr.push([
        this.sampleCSVDoctorData[i]?.name,
        this.sampleCSVDoctorData[i]?.phone,
        this.sampleCSVDoctorData[i]?.specialization,
        this.sampleCSVDoctorData[i]?.Gender,
        this.sampleCSVDoctorData[i]?.RegistrationNumber,
        this.sampleCSVDoctorData[i]?.RegistrationCouncil,
        this.sampleCSVDoctorData[i]?.Degree,
        this.sampleCSVDoctorData[i]?.College,
        this.sampleCSVDoctorData[i]?.yearOfCompletion,
        this.sampleCSVDoctorData[i]?.Experience,
        this.sampleCSVDoctorData[i]?.Owner,
        this.sampleCSVDoctorData[i]?.EstablishmentName,
        this.sampleCSVDoctorData[i]?.HospitalType,
        this.sampleCSVDoctorData[i]?.Street,
        this.sampleCSVDoctorData[i]?.Locality,
        this.sampleCSVDoctorData[i]?.City,
        this.sampleCSVDoctorData[i]?.State,
        this.sampleCSVDoctorData[i]?.Pincode,
        this.sampleCSVDoctorData[i]?.Country,
      ]);
    }
  }
  sampleHospitalArr: any = [];
  getSampleHospitalArr() {
    for (let i = 0; i < this.sampleCSVHospitalData.length; i++) {
      this.sampleHospitalArr.push([
        this.sampleCSVHospitalData[i]?.hospitalType,
        this.sampleCSVHospitalData[i]?.name,
        this.sampleCSVHospitalData[i]?.street,
        this.sampleCSVHospitalData[i]?.locality,
        this.sampleCSVHospitalData[i]?.City,
        this.sampleCSVHospitalData[i]?.phone,
        this.sampleCSVHospitalData[i]?.state,
        this.sampleCSVHospitalData[i]?.pincode,
        this.sampleCSVHospitalData[i]?.country,
      ]);
    }
  }
  sampleCSVHeader = [
    "Name",
    "Phone",
    "Specialization",
    "Gender",
    "Registration Number",
    "Registration Council",
    "Degree",
    "College",
    "Year Of Completion",
    "Experience",
    "Owner",
    "Establishment Name",
    "Hospital Type",
    "Street",
    "Locality",
    "City",
    "State",
    "Pincode",
    "Country",
  ];
  SampleCSVDoctor() {
    const aoa = [this.sampleCSVHeader, ...this.SampleDataArr];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws['!cols'] = this.sampleCSVHeader.map(() => ({ wch: 18 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sample Doctors');
    XLSX.writeFile(wb, 'Sample_Doctor_List.xlsx');
  }

  sampleCSVHospitalHeader = [
    "HOspital Type",
    "Name",
    "Street",
    "Locality",
    "City",
    "Phone",
    "State",
    "PinCode",
    "Country",
  ];
  SampleCSVHospital() {
    const aoa = [this.sampleCSVHospitalHeader, ...this.sampleHospitalArr];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws['!cols'] = this.sampleCSVHospitalHeader.map(() => ({ wch: 18 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sample Hospitals');
    XLSX.writeFile(wb, 'Sample_Hospital_List.xlsx');
  }

  exportHospitalToCSV() {
    const aoa = [this.hospitalExportedHeader, ...this.hospitalExporteddata];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws['!cols'] = this.hospitalExportedHeader.map(() => ({ wch: 20 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Hospitals');
    XLSX.writeFile(wb, 'Hospital_List.xlsx');
  }

  file: any;
  @ViewChild("uploadFile") uploadFile!: ElementRef;
  selectedFile: any = "";
  onChange(event: any) {
    this.selectedFile = this.uploadFile.nativeElement.value;
    this.file = event.target.files[0];
    const formData = new FormData();
    formData.append("file", this.file, this.file.name);
    this.uploadFile.nativeElement.value = "";
    this.loader.start();
    this.apiservice
      .Postdata(URLConstant.importDoctorList, formData, "")
      .subscribe({
        next: (res: any) => {
          if (res?.success == true) {
            this.loader.stop();
            if (res?.result?.successCount > 0) {
              this.toastr.success(
                res?.result?.successCount + " " + "Records Added"
              );
              this.doctorList("", "");
            } else if (res?.result?.successCount == 0) {
              this.toastr.success(
                res?.result?.successCount + " " + "Records Added"
              );
              this.doctorList("", "");
            }
          }
        },
        error: (err: any) => {
          this.loader.stop();
        },
      });
  }

  importHospital(event: any) {
    // if(this.uploadFile.nativeElement.value==this.selectedFile){
    //   this.toastr.error('You can not Re-Select Same File')
    //   this.uploadFile.nativeElement.value=''
    //   return;
    // }
    this.selectedFile = this.uploadFile.nativeElement.value;
    this.file = event.target.files[0];
    const formData = new FormData();
    formData.append("file", this.file, this.file.name);
    this.uploadFile.nativeElement.value = "";
    this.loader.start();

    this.apiservice
      .Postdata(URLConstant.importHospitalList, formData, "")
      .subscribe({
        next: (res: any) => {
          if (res?.success == true) {
            this.loader.stop();
            this.hospitalList("");

            this.toastr.success(
              res?.result?.successCount + " " + "Records Added"
            );
          }
        },
        error: (err: any) => {
          this.loader.stop();
        },
      });
  }
  redirectToDoctorDetails(details: any) {
    const rawCity = details?.city || details?.localityDetails?.[0]?.address?.city || '';
    const rawSlug = details?.profileSlug || details?.doctorDetails?.profileSlug || '';
    if (!rawCity || !rawSlug) return;
    let city = this.createSlug(rawCity);
    const url = `${this.baseurl}${city}/doctor/${rawSlug}`;
    window.open(url, "_blank");
  }

  createSlug(str: string) {
    const baseSlug = slugify(str, {
      lower: true,
      remove: undefined,
      strict: true,
    });
    return baseSlug;
  }
}

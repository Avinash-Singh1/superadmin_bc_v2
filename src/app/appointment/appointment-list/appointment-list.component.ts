import { Component, OnInit, ViewChild } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { log } from "console";
import { ToastrService } from "ngx-toastr";
import { debounceTime, distinctUntilChanged } from "rxjs";
import { URLConstant } from "src/app/apisURL/url";
import { ApiService } from "src/app/shared/api.service";
import * as XLSX from "xlsx";
import { DatePipe } from "@angular/common";

export interface PeriodicElement {
  name: string;
  position: string;
  weight: string;
  symbol: string;
  mobile: number;
  email: string;
  age: number;
  bloodgroup: string;
}

const ELEMENT_DATA: PeriodicElement[] = [];
@Component({
  selector: "app-appointment-list",
  templateUrl: "./appointment-list.component.html",
  styleUrls: ["./appointment-list.component.scss"],
})
export class AppointmentListComponent implements OnInit {
  displayedColumns: string[] = [
    "position",
    "BookedOn",
    "Address",
    "name",
    "Gender",
    "Mobile",
    "Email",
    "Age",
    "HospitalName",
    "Locality",
    "City",
    "BloodGroup",
  ];
  dataSource: any;
  page = 1;
  gender: boolean = false;
  totalLength: any;
  age: boolean = false;
  bloodGroup: boolean = false;
  isChecked: any = false;
  patientLists: any;
  pageSizeOptions: number[] = [10, 25, 50, 100];
  isSelected: boolean = false;
  bloodGroups: any;
  bloodGroupList: any = [{}];
  patientForm: any;
  ageParam: any = [];
  itemsPerPage: number = 10;
  bloodGroupParam: any = [];
  search = new UntypedFormControl();
  sortBy: any = {
    sortOrder: "",
    sort: "",
  };

  data: any = [];

  // Filter panel state
  showFilterPanel: boolean = false;
  filterGenderOpen: boolean = true;
  filterStatusOpen: boolean = true;
  filterDateOpen: boolean = true;
  filterGenderValue: any = '';
  filterStatusValue: any = '';
  activeFilterCount: number = 0;

  genderOptions = [
    { label: 'Male', value: 1 },
    { label: 'Female', value: 2 },
  ];

  ageLimit = [
    {
      age: "Below 18",
      value: "1",
      selected: false,
    },
    {
      age: "18-24",
      value: "2",
      selected: false,
    },
    {
      age: "25-34",
      value: "3",
      selected: false,
    },
    {
      age: "35-44",
      value: "4",
      selected: false,
    },
    {
      age: "55-64",
      value: "5",
      selected: false,
    },
    {
      age: "65 +",
      value: "6",
      selected: false,
    },
  ];
  appointmentStatus = [
    { content: 'Pending', value: 0, color: '#f0ad4e' },
    { content: 'Completed', value: 1, color: '#28a745' },
    { content: 'Cancelled', value: -1, color: '#dc3545' },
    { content: 'Rescheduled', value: -2, color: '#2196f3' },
  ];
  genders = [
    {
      gender: "Yesterday",
      value: "yesterday",
    },
    {
      gender: "Today",
      value: "today",
    },
    {
      gender: "Last 7 Days",
      value: "7days",
    },
    {
      gender: "Last 28 Days",
      value: "28days",
    },
    {
      gender: "Last 90 Days",
      value: "90days",
    },
    {
      gender: "This Month",
      value: "thismonth",
    },
  ];
  bloodType = [
    {
      bloodgroup: "A+",
      value: "1",
      selected: false,
    },
    {
      bloodgroup: "B+",
      value: "2",
      selected: false,
    },
    {
      bloodgroup: "A-",
      value: "3",
      selected: false,
    },
    {
      bloodgroup: "B-",
      value: "4",
      selected: false,
    },
    {
      bloodgroup: "O+",
      value: "5",
      selected: false,
    },
    {
      bloodgroup: "O-",
      value: "6",
      selected: false,
    },
    {
      bloodgroup: "AB+",
      value: "7",
      selected: false,
    },
    {
      bloodgroup: "AB-",
      value: "8",
      selected: false,
    },
  ];

  constructor(
    private dialog: MatDialog,
    public toastr: ToastrService,
    public apiservice: ApiService,
    public fb: UntypedFormBuilder,
    public datepipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.patientList("", "", "");
    this.patientListForm();
    this.downloadPatient();
    this.search.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((val) => this.searchFunction(val));
  }

  toggleFilterPanel() {
    this.showFilterPanel = !this.showFilterPanel;
  }

  closeFilterPanel() {
    this.showFilterPanel = false;
  }

  toggleFilterSection(section: string) {
    if (section === 'date') this.filterDateOpen = !this.filterDateOpen;
    if (section === 'status') this.filterStatusOpen = !this.filterStatusOpen;
    if (section === 'gender') this.filterGenderOpen = !this.filterGenderOpen;
  }

  selectGenderFilter(val: any) {
    this.filterGenderValue = val;
  }

  selectStatusFilter(val: any) {
    this.filterStatusValue = val;
    this.value = val;
  }

  applyFilters() {
    this.disableResetFilter = true;
    this.page = 1;
    this.patientList('', '', '', true);
    this.downloadPatient();
    this.showFilterPanel = false;
    this.countActiveFilters();
  }

  countActiveFilters() {
    let count = 0;
    if (this.toDate || this.fromDate) count++;
    if (this.value !== '' && this.value !== undefined) count++;
    if (this.filterGenderValue !== '' && this.filterGenderValue !== undefined) count++;
    this.activeFilterCount = count;
  }

  patientListForm() {
    this.patientForm = this.fb.group({
      gender: [""],
      age: [""],
      bloodgroup: [""],
    });
  }
  previousState: boolean = false;
  sortData(sort: string) {
    this.page = 1;
    switch (true) {
      case this.sortBy.sort != sort:
        this.sortBy = {
          sort,
          sortOrder: "ASC",
        };
        break;
      case this.sortBy.sortOrder == "DESC":
        this.sortBy = {
          sort: "",
          sortOrder: "",
        };
        break;
      case this.sortBy.sortOrder == "ASC":
        this.sortBy = {
          sort,
          sortOrder: "DESC",
        };
        break;
    }
    this.patientList("", "", "");
  }
  changeGender(type: any, event: any) {
    if (type == "gender") {
      this.gender = !this.gender;
    } else if (type == "age") {
      this.age = !this.age;
    } else if (type == "bloodGroup") {
      this.bloodGroup = !this.bloodGroup;
    }
  }
  ageBloodFilter(event: any, value: any, type: any) {
    let filter;
    if (value == "age" && event?.checked == true) {
      let index = this.ageLimit.findIndex(
        (el: any) => parseInt(el.value) == parseInt(type)
      );
      this.ageLimit[index].selected = true;
      this.ageParam.push(event.source?.value);
    } else if (value == "age" && event?.checked == false) {
      let index = this.ageLimit.findIndex(
        (el: any) => parseInt(el.value) == parseInt(type)
      );
      this.ageLimit[index].selected = false;
      console.log(this.ageLimit);
      this.ageParam.findIndex((ele: any) => {
        if (ele === event.source.value) {
          let ages = this.ageParam.indexOf(ele);
          this.ageParam.splice(ages, 1);
        }
      });
    }

    if (value == "bloodGroup" && event?.checked == true) {
      let index = this.bloodType.findIndex(
        (el: any) => parseInt(el.value) == parseInt(type)
      );
      this.bloodType[index].selected = true;
      this.bloodGroupParam.push(event.source?.value);
    } else if (value == "bloodGroup" && event?.checked == false) {
      let index = this.bloodType.findIndex(
        (el: any) => parseInt(el.value) == parseInt(type)
      );
      this.bloodType[index].selected = false;
      this.bloodGroupParam.findIndex((ele: any) => {
        if (ele === event.source.value) {
          let bloods = this.bloodGroupParam.indexOf(ele);
          this.bloodGroupParam.splice(bloods, 1);
        }
      });
    }
  }

  getTimeSLot: any;
  toDate: any;
  fromDate: any;
  date = new Date();
  oldDate = new Date();
  day = new Date(this.oldDate.setDate(this.oldDate.getDate() - 1));
  selectedDates(event: any, value: any, getValue: any) {
    console.log(event);
    switch (true) {
      case event?.value == "yesterday" || event == "yesterday": {
        this.day.setHours(0);
        this.day.setMinutes(0);
        this.day.setSeconds(0);
        this.day.setMilliseconds(0);
        this.date.setHours(0);
        this.date.setMinutes(0);
        this.date.setSeconds(0);
        this.date.setMilliseconds(0);
        this.toDate = this.date.toISOString();
        this.fromDate = this.day.toISOString();
        break;
      }
      case event?.value == "today" || event == "today": {
        var todatDate = new Date();
        var currentTime = new Date();
        todatDate.setHours(0);
        todatDate.setMinutes(0);
        todatDate.setSeconds(0);
        todatDate.setMilliseconds(0);
        this.toDate = currentTime.toISOString();
        this.fromDate = todatDate.toISOString();
        break;
      }
      case event?.value == "7days" || event == "7days": {
        var weekday = new Date(
          this.oldDate.setDate(this.oldDate.getDate() - 7)
        );

        weekday.setHours(0);
        weekday.setMinutes(0);
        weekday.setSeconds(0);
        weekday.setMilliseconds(0);
        this.date.setHours(0);
        this.date.setMinutes(0);
        this.date.setSeconds(0);
        this.date.setMilliseconds(0);
        this.toDate = this.date.toISOString();
        this.fromDate = weekday.toISOString();
        break;
      }
      case event?.value == "28days" || event == "28days": {
        var monthlyday = new Date(
          this.oldDate.setDate(this.oldDate.getDate() - 28)
        );

        monthlyday.setHours(0);
        monthlyday.setMinutes(0);
        monthlyday.setSeconds(0);
        monthlyday.setMilliseconds(0);
        this.date.setHours(0);
        this.date.setMinutes(0);
        this.date.setSeconds(0);
        this.date.setMilliseconds(0);
        this.toDate = this.date.toISOString();
        this.fromDate = monthlyday.toISOString();
        break;
      }
      case event?.value == "90days" || event == "90days": {
        var threeMonths = new Date(
          this.oldDate.setDate(this.oldDate.getDate() - 90)
        );

        threeMonths.setHours(0);
        threeMonths.setMinutes(0);
        threeMonths.setSeconds(0);
        threeMonths.setMilliseconds(0);
        this.date.setHours(0);
        this.date.setMinutes(0);
        this.date.setSeconds(0);
        this.date.setMilliseconds(0);
        this.toDate = this.date.toISOString();
        this.fromDate = threeMonths.toISOString();
        break;
      }
      case event?.value == "thismonth" || event == "thismonth": {
        this.getTimeSLot = this.datepipe.transform(this.date, "dd");
        var thisMonth = new Date(
          this.oldDate.setDate(this.oldDate.getDate() - (this.getTimeSLot - 1))
        );
        thisMonth.setHours(0);
        thisMonth.setMinutes(0);
        thisMonth.setSeconds(0);
        thisMonth.setMilliseconds(0);
        this.date.setHours(0);
        this.date.setMinutes(0);
        this.date.setSeconds(0);
        this.date.setMilliseconds(0);
        this.toDate = this.date.toISOString();
        this.fromDate = thisMonth.toISOString();

        break;
      }
      case this.selectedEndDate == true: {
        this.fromDate = this.startdate.toISOString();
        this.toDate = this.enddate.toISOString();
        break;
      }
    }
  }
  value: any;
  selectStatus(value: any) {
    this.value = value;
  }
  disableResetFilter: boolean = false;
  patientList(event: any, value: any, getValue: any, disableButton?: any) {
    if (disableButton == true) {
      this.disableResetFilter = true;
    }
    let data: any = {
      page: this.page,
      size: this.itemsPerPage,
      toDate: this.toDate,
      fromDate: this.fromDate,
      status: this.value,
      search: this.search.value,
      gender: this.filterGenderValue,
    };
    let param = { ...data, ...this.sortBy };
    Object.keys(param).forEach((key) => {
      if (
        param[key] === null ||
        param[key] === undefined ||
        param[key] === ""
      ) {
        delete param[key];
      }
    });
    this.apiservice.Postdata(URLConstant.appointmentList, "", param).subscribe(
      (res: any) => {
        this.dataSource = res?.result?.data;
        this.totalLength = res?.result?.count;
        for (let i = 0; i < this.dataSource.length; i++) {
          this.dataSource[i]["name"] =
            this.dataSource[i]?.patientName?.split(" ");
        }
      },
      (error) => {
        this.toastr.error(error.message);
      }
    );
  }

  searchFunction(value: any) {
    this.page = 1;
    this.patientList(value, "", "");
  }
  updatePageNumer(event: any) {
    this.page = event;
    this.patientList(this.patientForm.value.gender, "", "");
  }

  get totalPages(): number {
    return Math.ceil((this.totalLength || 0) / this.itemsPerPage);
  }

  get showingFrom(): number {
    return this.totalLength ? (this.page - 1) * this.itemsPerPage + 1 : 0;
  }

  get showingTo(): number {
    return Math.min(this.page * this.itemsPerPage, this.totalLength || 0);
  }

  onItemsPerPageChange(size: number) {
    this.itemsPerPage = size;
    this.page = 1;
    this.patientList(this.patientForm.value.gender, "", "");
  }

  result: any;
  downloadPatient() {
    this.result = "";
    this.data = [];
    let param: any = {
      isExport: true,
      toDate: this.toDate,
      fromDate: this.fromDate,
      status: this.value,
      search: this.search.value,
      gender: this.filterGenderValue,
    };
    Object.keys(param).forEach((key) => {
      if (
        param[key] === null ||
        param[key] === undefined ||
        param[key] === ""
      ) {
        delete param[key];
      }
    });
    this.apiservice
      .Postdata(URLConstant.appointmentList, "", param)
      .subscribe((res: any) => {
        this.result = res?.result?.data;
        for (let i = 0; i < this.result.length; i++) {
          const statusVal = this.result[i]?.status;
          const statusText = statusVal == 0 ? 'Pending'
            : statusVal == 1 ? 'Completed'
            : statusVal == -1 ? 'Cancelled'
            : statusVal == -2 ? 'Rescheduled' : '';
          this.data.push([
            this.result[i]?.createdAt,
            this.result[i]?.slot,
            this.result[i]?.patientName,
            this.result[i]?.patientGender == 1 ? "Male" : "Female",
            this.result[i]?.patientPhone,
            this.result[i]?.doctorName,
            this.result[i]?.doctorPhone,
            this.result[i]?.establishmentName,
            this.result[i]?.establishmentLocality,
            this.result[i]?.establishmentCity,
            statusText,
          ]);
        }
      });
  }
  header = [
    "Booked On",
    "Appointment Date/Time",
    "Patient Name",
    "Patient Gender",
    "Patient Phone",
    "Doctor Name",
    "Doctor Phone",
    "Hospital Name",
    "Hospital Locality",
    "Hospital City",
    "Status",
  ];

  exportToCSV() {
    this.result = "";
    this.data = [];
    let param: any = {
      isExport: true,
      toDate: this.toDate,
      fromDate: this.fromDate,
      status: this.value,
      search: this.search.value,
      gender: this.filterGenderValue,
    };
    Object.keys(param).forEach((key) => {
      if (param[key] === null || param[key] === undefined || param[key] === "") {
        delete param[key];
      }
    });
    this.apiservice
      .Postdata(URLConstant.appointmentList, "", param)
      .subscribe((res: any) => {
        this.result = res?.result?.data;
        for (let i = 0; i < this.result.length; i++) {
          const statusVal = this.result[i]?.status;
          const statusText = statusVal == 0 ? 'Pending'
            : statusVal == 1 ? 'Completed'
            : statusVal == -1 ? 'Cancelled'
            : statusVal == -2 ? 'Rescheduled' : '';
          this.data.push([
            this.result[i]?.createdAt,
            this.result[i]?.slot,
            this.result[i]?.patientName,
            this.result[i]?.patientGender == 1 ? "Male" : "Female",
            this.result[i]?.patientPhone,
            this.result[i]?.doctorName,
            this.result[i]?.doctorPhone,
            this.result[i]?.establishmentName,
            this.result[i]?.establishmentLocality,
            this.result[i]?.establishmentCity,
            statusText,
          ]);
        }
        const wsData = [this.header, ...this.data];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        // Auto-size columns
        ws['!cols'] = this.header.map((_: string, i: number) => {
          const maxLen = Math.max(
            this.header[i].length,
            ...this.data.map((row: any[]) => String(row[i] || '').length)
          );
          return { wch: Math.min(maxLen + 2, 40) };
        });
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Appointments');
        XLSX.writeFile(wb, 'Appointment_List.xlsx');
      });
  }
  @ViewChild("picker") picker: any;
  selectedDate: any;

  openDatePicker() {
    this.patientForm.controls["gender"].reset();
    this.picker.open();
  }
  startdate: any;
  enddate: any;
  startDate(event: any) {
    this.startdate = event?.value;
  }
  selectedEndDate: boolean = false;
  endDate(event: any) {
    if (event) {
      this.enddate = event?.value;
      this.selectedEndDate = true;
      this.patientForm.controls["gender"].reset();

      this.selectedDates("", "", "");
    }
  }
  resetFilters() {
    this.patientForm.reset();
    this.page = 1;
    this.itemsPerPage = 10;
    this.toDate = '';
    this.fromDate = '';
    this.value = '';
    this.filterGenderValue = '';
    this.filterStatusValue = '';
    this.selectedEndDate = false;
    this.activeFilterCount = 0;
    this.patientList('', '', '');
    this.disableResetFilter = false;
    this.showFilterPanel = false;
  }
}

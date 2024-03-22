import { Component, OnInit } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { log } from "console";
import { ToastrService } from "ngx-toastr";
import { debounceTime, distinctUntilChanged } from "rxjs";
import { URLConstant } from "src/app/apisURL/url";
import { ApiService } from "src/app/shared/api.service";
import { ngxCsv } from "ngx-csv/ngx-csv";

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
  selector: "app-patients-list",
  templateUrl: "./patients-list.component.html",
  styleUrls: ["./patients-list.component.scss"],
})
export class PatientsListComponent implements OnInit {
  displayedColumns: string[] = [
    "position",
    "name",
    "Gender",
    "Address",
    "Mobile",
    "Email",
    "Age",
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
  isSelected: boolean = false;
  bloodGroups: any;
  bloodGroupList: any = [{}];
  patientForm: any;
  ageParam: any = [];
  itemsPerPage: number = 10;
  bloodGroupParam: any = [];
  search = new UntypedFormControl();
  sortBy: any = {
    sort: "",
    sortOrder: "",
  };
  fullNameASC: boolean = true;
  fullNameDESC: boolean = false;
  ageASC: boolean = true;
  ageDESC: boolean = false;
  bloodASC: boolean = true;
  bloodDESC: boolean = false;
  genderASC: boolean = true;
  genderDESC: boolean = false;
  data: any = [];

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
  genders = [
    {
      gender: "Male",
      value: "male",
    },
    {
      gender: "Female",
      value: "female",
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
    public fb: UntypedFormBuilder
  ) {}

  ngOnInit(): void {
    this.patientList("", "");
    this.patientListForm();
    this.downloadPatient();
    this.search.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((val) => this.searchFunction(val));
  }

  patientListForm() {
    this.patientForm = this.fb.group({
      gender: [""],
      age: [""],
      bloodgroup: [""],
    });
  }

  sortData(sort: any) {
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
    this.patientList("", "");
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
  genderParam: any = "";
  genderCheck(event: any, value: any, disable?: any) {
    console.log("hello", event);
    if (disable == true) {
      this.disableResetFilter = true;
    }
    if (event?.value == "male" || event == "male") {
      this.genderParam = 1;
    } else if (event?.value == "female" || event == "female") {
      this.genderParam = 2;
    }
    this.patientList("", "");
  }
  disableResetFilter: boolean = false;
  resetcheckbox = new UntypedFormControl();
  patientList(event: any, value: any, disable?: any) {
    let data: any = {
      page: this.page,
      size: this.itemsPerPage,
      gender: this.genderParam,
      age: this.ageParam.join(),
      bloodGroup: this.bloodGroupParam.join(),
      search: this.search.value,
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

  searchFunction(value: any) {
    this.page = 1;
    this.patientList(value, "");
  }
  updatePageNumer(event: any) {
    this.page = event;
    this.patientList(this.patientForm.value.gender, "");
    console.log("helloss", this.patientForm.value.gender);
  }

  result: any;
  downloadPatient() {
    this.result = "";
    this.data = [];
    let param: any = {
      isExport: true,
      gender: this.genderParam,
      age: this.ageParam.join(),
      bloodGroup: this.bloodGroupParam.join(),
      search: this.search.value,
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
      .GetData(URLConstant.patientList, param)
      .subscribe((res: any) => {
        this.result = res?.result?.data;
        for (let i = 0; i < this.result.length; i++) {
          this.data.push([
            this.result[i]?.fullName,
            this.result[i]?.gender == 1 ? "Male" : "Female",
            this.result[i]?.address?.city,
            this.result[i]?.phone,
            this.result[i]?.bloodGroup == 1
              ? "A+"
              : this.result[i]?.bloodGroup == 2
              ? "B+"
              : this.result[i]?.bloodGroup == 3
              ? "A-"
              : this.result[i]?.bloodGroup == 4
              ? "B-"
              : this.result[i]?.bloodGroup == 5
              ? "O+"
              : this.result[i]?.bloodGroup == 6
              ? "O-"
              : this.result[i]?.bloodGroup == 7
              ? "AB+"
              : this.result[i]?.bloodGroup == 8
              ? "AB-"
              : "N/A",
          ]);
        }
      });
  }
  header = ["Name", "Gender", "Address", "Mobile", "Blood Group"];

  exportToCSV() {
    const headers = this.header;
    var options = {
      fieldSeparator: ",",
      quoteStrings: '"',
      decimalseparator: ".",
      showLabels: true,
      showTitle: true,
      // title: 'Your title',
      useBom: true,
      headers: headers,
    };
    new ngxCsv(this.data, "PatientList", options);
  }
  resetFilters() {
    this.disableResetFilter = false;
    for (let i = 0; i < this.ageLimit.length; i++) {
      this.ageLimit[i].selected = false;
    }
    for (let i = 0; i < this.bloodType.length; i++) {
      this.bloodType[i].selected = false;
    }

    this.patientForm.reset();
    let data: any = {
      page: this.page,
      size: this.itemsPerPage,
    };

    this.apiservice.GetData(URLConstant.patientList, data).subscribe(
      (res: any) => {
        this.dataSource = res?.result?.data;
        this.totalLength = res?.result?.count;

        for (let i = 0; i < this.dataSource.length; i++) {
          this.dataSource[i]["name"] = this.dataSource[i]?.fullName?.split(" ");
          switch (true) {
            case this.dataSource[i]?.bloodGroup == 1:
              this.dataSource[i].bloodGroup = "A+";
              break;
            case this.dataSource[i]?.bloodGroup == 2:
              this.dataSource[i].bloodGroup = "B+";
              break;
            case this.dataSource[i]?.bloodGroup == 3:
              this.dataSource[i].bloodGroup = "A-";
              break;
            case this.dataSource[i]?.bloodGroup == 4:
              this.dataSource[i].bloodGroup = "B-";
              break;
            case this.dataSource[i]?.bloodGroup == 5:
              this.dataSource[i].bloodGroup = "O+";
              break;
            case this.dataSource[i]?.bloodGroup == 6:
              this.dataSource[i].bloodGroup = "O-";
              break;
            case this.dataSource[i]?.bloodGroup == 7:
              this.dataSource[i].bloodGroup = "AB+";
              break;
            case this.dataSource[i]?.bloodGroup == 8:
              this.dataSource[i].bloodGroup = "AB-";
              break;
            default:
              this.dataSource[i].bloodGroup = "N/A";
          }
          this.bloodGroupList = [
            {
              bg: this.bloodGroups,
            },
          ];
        }
      },
      (error) => {
        this.toastr.error(error.message);
      }
    );
  }
}

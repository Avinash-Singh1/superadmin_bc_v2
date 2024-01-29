import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormControl } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { ToastrService } from "ngx-toastr";
import { debounceTime, distinctUntilChanged } from "rxjs";
import { URLConstant } from "src/app/apisURL/url";
import { AddNewDoctorComponent } from "src/app/dialogs/add-new-doctor/add-new-doctor.component";
import { ApiService } from "src/app/shared/api.service";
import { ngxCsv } from "ngx-csv/ngx-csv";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { environment } from "src/environments/environment";
import slugify from "slugify";

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
  search = new FormControl();
  toggle = new FormControl();
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
    private fb: FormBuilder,
    private loader: NgxUiLoaderService
  ) {}

  ngOnInit(): void {
    this.filterGroup();
    this.doctorList("", "");
    this.downloadDoctorList();
    this.downloadHospitalList();
    this.hospitalList("");
    this.specializationList();
    this.typeOfHospitalList();
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

  chnageDoctorList(list: any) {
    if (list == "doctors") {
      this.doctorsList = true;
      this.hospitalsList = false;
      this.search.reset();
      this.filterForm.reset();
      this.citiesParam = [];
      this.hospitalParam = [];
      this.doctorList("", "");
    } else if (list == "hospitals") {
      this.hospitalsList = true;
      this.doctorsList = false;
      this.search.reset();
      this.filterForm.reset();
      this.citiesParam = [];
      this.specializationParam = [];
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
      console.log(this.typeOfHospital, "=-=-=-=-=-=-=-");
      let index = this.typeOfHospital.findIndex(
        (el: any) => el?._id == event?.source?.value
      );
      console.log("uu", this.typeOfHospital[index]?.selected);
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
    };
    let data = { ...param, ...this.sortBy };
    Object.keys(data).forEach((key) => {
      if (data[key] === null || data[key] === undefined || data[key] === "") {
        delete data[key];
      }
    });

    this.apiservice.GetData(URLConstant.doctorList, data).subscribe(
      (res: any) => {
        this.dataSource = res?.result[0]?.data;
        this.getLength = res?.result[0]?.totalCount;
        this.totalLength = res?.result[0]?.totalCount[0]?.count;
        for (let i = 0; i < this.dataSource.length; i++) {
          this.dataSource[i]["name"] =
            this.dataSource[i]?.doctorDetails?.fullName?.split(" ");
        }
      },
      (error) => {
        this.toastr.error(error.message);
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
        this.dataSourceHospital = res?.result?.data;
        this.totalLengthHospital = res?.result?.count;
        for (let i = 0; i < this.dataSourceHospital.length; i++) {
          this.dataSourceHospital[i]["name"] =
            this.dataSourceHospital[i]?.hospitalName?.split(" ");
        }
      },
      (error) => {
        this.toastr.error(error.message);
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
  downloadDoctorList(param?: any) {
    this.data = [];
    this.result = "";
    let data: any = {
      isExport: true,
      specialization: this.specializationParam.join(),
      cities: this.citiesParam.join(),
      search: this.search.value,
    };
    Object.keys(data).forEach((key) => {
      if (data[key] === null || data[key] === undefined || data[key] === "") {
        delete data[key];
      }
    });
    this.apiservice
      .GetData(URLConstant.doctorList, data)
      .subscribe((res: any) => {
        //if(param){
        if (res?.success) {
          this.result = res?.result[0]?.data;
          for (let i = 0; i < this.result.length; i++) {
            this.data.push([
              this.result[i]?.profilePic,
              this.result[i]?.doctorDetails?.fullName,
              this.result[i]?.specialization[0]?.name,
              this.result[i]?.city || "N/A",
              this.result[i]?.education[0]?.degree,
              this.result[i]?.doctorDetails?.phone,
              this.result[i]?.email,
              this.result[i]?.createdAt,
            ]);
          }
          if (param) this.exportToCSV();
        }
        //}
      });
  }
  hospitalExport: any;
  hospitalExporteddata: any = [];
  downloadHospitalList(param?: any) {
    console.log("traun");
    this.hospitalExporteddata = [];
    this.hospitalExport = "";
    let data: any = {
      isExport: true,
      hospitalType: this.hospitalParam.join(),
      city: this.citiesParam.join(),
      search: this.search.value,
    };
    Object.keys(data).forEach((key) => {
      if (data[key] === null || data[key] === undefined || data[key] === "") {
        delete data[key];
      }
    });
    this.apiservice
      .GetData(URLConstant.hospitalList, data)
      .subscribe((res: any) => {
        this.hospitalExport = res?.result?.data;
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
        console.log("before hello");
        if (param) {
          console.log("hello");
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
    "Joining Date",
  ];

  activeInactiveHospital(status: any, id: any) {
    console.log(status);
    let param = {
      hospitalId: id,
    };
    let data = {
      isVerified: status,
    };
    this.apiservice
      .PutData(URLConstant.addHospital, data, param)
      .subscribe((res: any) => {});
  }
  activeInactiveDoctor(status: any, id: any) {
    console.log("status", status);
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
    const headers = this.header;

    var options = {
      fieldSeparator: ",",
      quoteStrings: '"',
      decimalseparator: ".",
      showLabels: true,
      showTitle: true,
      useBom: true,
      headers: headers,
    };
    new ngxCsv(this.data, "doctorList", options);
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
    const headers = this.sampleCSVHeader;
    var options = {
      fieldSeparator: ",",
      quoteStrings: '"',
      decimalseparator: ".",
      showLabels: true,
      showTitle: true,
      useBom: true,
      headers: headers,
    };
    new ngxCsv(this.SampleDataArr, "Sample Doctor List", options);
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
    const headers = this.sampleCSVHospitalHeader;
    var options = {
      fieldSeparator: ",",
      quoteStrings: '"',
      decimalseparator: ".",
      showLabels: true,
      showTitle: true,
      useBom: true,
      headers: headers,
    };
    new ngxCsv(this.sampleHospitalArr, "Sample Hospital List", options);
  }

  exportHospitalToCSV() {
    const headers = this.hospitalExportedHeader;
    var options = {
      fieldSeparator: ",",
      quoteStrings: '"',
      decimalseparator: ".",
      showLabels: true,
      showTitle: true,
      useBom: true,
      headers: headers,
    };
    new ngxCsv(this.hospitalExporteddata, "Hospital List", options);
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
    console.log(formData);
    this.uploadFile.nativeElement.value = "";
    this.loader.start();

    this.apiservice
      .Postdata(URLConstant.importHospitalList, formData, "")
      .subscribe({
        next: (res: any) => {
          if (res?.success == true) {
            this.loader.stop();
            if (res?.result?.successCount > 0) {
              this.toastr.success(
                res?.result?.successCount + " " + "Records Added"
              );
              this.hospitalList("");
            } else if (res?.result?.successCount == 0) {
              this.toastr.success(
                res?.result?.successCount + " " + "Records Added"
              );
              this.hospitalList("");
            }
          }
        },
        error: (err: any) => {
          this.loader.stop();
        },
      });
  }
  redirectToDoctorDetails(details: any) {
    let city = this.createSlug(details.localityDetails?.[0]?.address?.city);
    const url = `${this.baseurl}${city}/doctor/${details.profileSlug}`;
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

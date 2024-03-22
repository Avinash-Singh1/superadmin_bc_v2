import { MapsAPILoader } from "@agm/core";
import { MouseEvent } from "@agm/core";
import { TitleCasePipe, UpperCasePipe } from "@angular/common";
import {
  Component,
  Inject,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  NgZone,
} from "@angular/core";

import { UntypedFormBuilder, UntypedFormControl, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { ToastrService } from "ngx-toastr";
import {
  Observable,
  debounceTime,
  distinctUntilChanged,
  map,
  startWith,
} from "rxjs";
import { URLConstant } from "src/app/apisURL/url";
import { ApiService } from "src/app/shared/api.service";
import { ValidationService } from "src/app/shared/validation.service";

declare const google: any;
// declare global {
//   interface Window {
//     google: typeof google;
//   }
// }
@Component({
  selector: "app-add-new-doctor",
  templateUrl: "./add-new-doctor.component.html",
  styleUrls: ["./add-new-doctor.component.scss"],
})
export class AddNewDoctorComponent implements OnInit, AfterViewInit {
  addDoctor: boolean = this.data?.doctorlist;
  medicalRegistar: boolean = false;
  education: boolean = false;
  practice: boolean = false;
  establishment: boolean = false;
  location: boolean = false;
  newEstablishment: boolean = this.data?.hospitallist;
  lat: any;
  lng: any;
  OccupationList: any;
  searchCity: any;

  getdegreeList: any;
  getCollegeList: any;
  docorName: any;
  registration: any;
  educationDetail: any;
  connectPractice: any;
  establishmentDetail: any;
  hospitalEstablishment: any;
  mapLocation: any;
  submitted: boolean = false;
  selectedItems: any;
  dropdownSettings = {};
  companyList: any = [];
  getEditDetail: any;
  typeOfHospital: any;
  stateList: any;
  cityList: any;
  specialisationValues: any = [];
  gender = [
    {
      value: "Male",
      type: 1,
    },
    {
      value: "Female",
      type: 2,
    },
    {
      value: "Other",
      type: 3,
    },
  ];
  connectpractice = [
    {
      value: "Own a establishment",
      type: true,
      class: true,
      status: "",
    },
    {
      value: "Visit a establishment",
      type: false,
      status: "disable",
    },
  ];
  specialization = [
    "Dental",
    "Orthopaedics",
    "General Surgery",
    "ENT",
    "Obstetrics/Gynaecology",
  ];
  establishMentType = [
    "Clinic",
    "Multi-Speciality Clinic",
    "Hospital",
    "Multi-Speciality Hospital",
    "Super Speciality Hospital",
  ];
  constructor(
    public closeModal: MatDialogRef<AddNewDoctorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    private apiservice: ApiService,
    public validationService: ValidationService,
    public toastr: ToastrService,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone
  ) {
    this.mapsAPILoader.load().then((res: any) => {
      this.placeService = new google.maps.places.PlacesService(
        document.createElement("div")
      );
    });
  }
  inputText: string = "";
  visitType: boolean = true;
  titleCasePipe = new TitleCasePipe();
  upperCasePipe = new UpperCasePipe();
  ngOnInit(): void {
    this.specializationList();
    this.doctorGroups();
    this.establishmentLists();
    this.typeOfHospitalList();
    this.filterAutoComplete();
    this.filterAutoCompletes();
    this.getState();
    this.dropdownSettings = {
      singleSelection: false,
      idField: "id",
      textField: "displayValue",
      enableCheckAll: false,
      itemsShowLimit: 3,
      allowSearchFilter: true,
    };
  }
  applyTitleCaseTransformation(controlName: string, groupname: any) {
    groupname.get(controlName).valueChanges.subscribe((newValue: any) => {
      const transformedValue = this.titleCasePipe.transform(newValue);
      groupname
        .get(controlName)
        .setValue(transformedValue, { emitEvent: false });
    });
  }
  applyUpperCaseTransformation(controlName: string, groupname: any) {
    groupname.get(controlName).valueChanges.subscribe((newValue: any) => {
      const transformedValue = this.upperCasePipe.transform(newValue);
      groupname
        .get(controlName)
        .setValue(transformedValue, { emitEvent: false });
    });
  }
  doctorGroups() {
    this.docorName = this.fb.group({
      name: ["", Validators.required],
      mobile: ["", Validators.required],
      specialization: ["", Validators.required],
      gender: ["", Validators.required],
    });
    this.applyTitleCaseTransformation("name", this.docorName);
    this.registration = this.fb.group({
      regNumber: ["", Validators.required],
      regCouncil: ["", Validators.required],
      regYear: ["", Validators.required],
    });
    this.applyTitleCaseTransformation("regCouncil", this.registration);

    this.educationDetail = this.fb.group({
      degree: ["", Validators.required],
      college: ["", Validators.required],
      completionYear: ["", Validators.required],
      experienceYear: ["", Validators.required],
    });
    this.applyTitleCaseTransformation("college", this.educationDetail);
    this.applyUpperCaseTransformation("degree", this.educationDetail);

    this.connectPractice = this.fb.group({
      establishment: ["", Validators.required],
    });
    this.establishmentDetail = this.fb.group({
      // estName: ['', Validators.required],
      estType: ["", Validators.required],
    });
    this.myControls.valueChanges.subscribe((newValue) => {
      const transformedValue = this.titleCasePipe.transform(newValue);
      this.myControls.setValue(transformedValue, { emitEvent: false });
    });
    this.mapLocation = this.fb.group({
      // street: ['', Validators.required],
      locality: ["", Validators.required],
      // city: ['', Validators.required],
      state: ["", Validators.required],
      pinCode: ["", Validators.required],
    });
    this.applyTitleCaseTransformation("locality", this.mapLocation);
    // this.applyTitleCaseTransformation('city',this.mapLocation);
    this.applyTitleCaseTransformation("state", this.mapLocation);

    this.hospitalEstablishment = this.fb.group({
      // name:['',Validators.required],
      type: ["", Validators.required],
      mobile: ["", Validators.required],
    });
  }
  medicalRegistration(type: any) {
    this.submitted = true;
    if (type == "medical" && this.docorName.valid) {
      if (this.selectedItems?.length > 0) {
        this.selectedItems.forEach((el: any) => {
          this.companyList?.push(el?.id);
        });
      }
      this.addDoctor = false;
      this.medicalRegistar = true;
      this.submitted = false;
    } else if (type == "education" && this.registration.valid) {
      this.medicalRegistar = false;
      this.education = true;
      this.submitted = false;
    } else if (type == "practice" && this.educationDetail.valid) {
      this.education = false;
      this.practice = true;
      this.submitted = false;
    } else if (type == "establishment" && this.connectPractice.valid) {
      this.practice = false;
      this.establishment = true;
      this.submitted = false;
    } else if (type == "location" && this.establishmentDetail.valid) {
      this.establishment = false;
      this.location = true;
      this.submitted = false;
    } else if (type == "validform" && this.mapLocation.valid) {
      this.location = false;
      this.submitted = false;
    } else if (type == "newEstablishment" && this.hospitalEstablishment.valid) {
      this.newEstablishment = false;
      this.location = true;
      this.submitted = false;
    }
  }
  cancelForm(type: any) {
    if (type == "medical") {
      this.addDoctor = true;
      this.medicalRegistar = false;
    } else if (type == "education") {
      this.medicalRegistar = true;
      this.education = false;
    } else if (type == "practice") {
      this.education = true;
      this.practice = false;
    } else if (type == "establishment") {
      this.practice = true;
      this.establishment = false;
    }
  }
  get docorcontrols() {
    return this.docorName.controls;
  }
  get registrationControls() {
    return this.registration.controls;
  }
  get educationDetailControls() {
    return this.educationDetail.controls;
  }
  get connectPracticeControls() {
    return this.connectPractice.controls;
  }
  get establishmentDetailControls() {
    return this.establishmentDetail.controls;
  }
  get mapLocationControls() {
    return this.mapLocation.controls;
  }
  get hospitalControls() {
    return this.hospitalEstablishment.controls;
  }
  addDoctorDetails() {
    // this.searchCity=this.mapLocation.value.city,
    // console.log(this.searchCity)
    console.log("hello", this.searchAddress);
    if (this.data?.doctorlist == true) {
      let data: any = {
        hospitalId: this.getHospitalId ? this.getHospitalId : this.hospitalIds,
        fullName: this.docorName.value.name,
        phone: this.docorName.value.mobile,
        specialization: this.companyList ? this.companyList : "",
        gender: this.docorName.value.gender,
        medicalRegistration: {
          registrationNumber: this.registration.value.regNumber,
          year: this.registration.value.regYear.toString(),
          council: this.registration.value.regCouncil,
        },
        education: [
          {
            degree: this.educationDetail.value.degree,
            college: this.educationDetail.value.college,
            year: this.educationDetail.value.completionYear,
          },
        ],
        experience: this.educationDetail.value.experienceYear.toString(),
        isOwner: this.connectPractice.value.establishment == true ? 1 : 0,
        // establishmentName: this.establishmentDetail.value.estName,
        establishmentName: this.myControls.value,

        hospitalTypeId: this.establishmentDetail.value.estType,
        address: {
          landmark: this.searchAddress.trim(),
          // address: this.mapLocation.value.street,
          locality: this.mapLocation?.value?.locality?.trim(),
          city: this.searchCity?.trim(),
          state: this.mapLocation.value?.state?.trim(),
          pincode: this.mapLocation.value?.pinCode?.trim(),
          country: "India",
        },
        location: {
          // "lat": '28.616932030577047',
          // "long": '77.21013931793483'
          coordinates: [this.lng, this.lat],
        },
      };
      Object.keys(data).forEach((key) => {
        if (data[key] === null || data[key] === undefined || data[key] === "") {
          delete data[key];
        }
      });
      if (this.data?.data == "Add New") {
        if (this.mapLocation.valid) {
          this.apiservice
            .Postdata(URLConstant.addDoctor, data, "")
            .subscribe((res: any) => {
              if (res.success) {
                this.closeModal.close(true);
                this.toastr.success("Doctor has been created");
              }
            });
        }
      } else if (this.data?.data == "Edit") {
        if (this.mapLocation.valid) {
          let param = {
            doctorId: this.data?.id,
          };
          this.apiservice
            .PutData(URLConstant.editDoctor, data, param)
            .subscribe((res: any) => {
              if (res.success) {
                this.closeModal.close(true);
                this.toastr.success("Doctor has been edited");
              }
            });
        }
      }
    } else if (this.data?.hospitallist == true) {
      this.submitted = true;
      if (this.hospitalEstablishment.valid) {
        let data = {
          // fullName: this.hospitalEstablishment.value.name,
          fullName: this.myControl.value,
          hospitalType: this.hospitalEstablishment.value.type,
          phone: this.hospitalEstablishment.value.mobile,

          address: {
            // street:this.searchAddress,
            landmark: this.searchAddress.trim(),
            locality: this.mapLocation.value.locality.trim(),
            city: this.searchCity.trim(),
            state: this.mapLocation.value.state.trim(),
            pincode: this.mapLocation.value.pinCode.trim(),
          },
          location: {
            // "lat": '28.616932030577047',
            // "long": '77.21013931793483'
            coordinates: [this.lng, this.lat],
          },
        };
        if (this.data?.data == "Add New") {
          if (this.mapLocation.valid) {
            let param = {
              doctorId: this.data?.id,
            };
            this.apiservice
              .Postdata(URLConstant.addHospital, data, param)
              .subscribe((res: any) => {
                if (res.success) {
                  if (res.success) {
                    this.closeModal.close(true);
                    this.toastr.success("Hospital has been created");
                  }
                }
              });
          }
        } else if (this.data?.data == "Edit") {
          if (this.mapLocation.valid) {
            let param = {
              hospitalId: this.data?.id,
            };
            this.apiservice
              .PutData(URLConstant.addHospital, data, param)
              .subscribe((res: any) => {
                if (res.success) {
                  if (res.success) {
                    this.closeModal.close(true);
                    this.toastr.success("Hospital has been edited");
                  }
                }
              });
          }
        }
      }
    }
  }
  arr: any = [];
  hospitalListed: any;
  getHospitalId: any;
  editDoctorDetail() {
    if (this.data?.doctorlist == true) {
      if (this.data?.data == "Edit") {
        let param = {
          type: 3,
          doctorId: this.data?.id,
        };
        this.apiservice
          .GetData(URLConstant?.doctorProfile, param)
          .subscribe((res: any) => {
            this.getEditDetail = res?.result;
            this.getHospitalId =
              res?.result?.sectionA?.establishmentDetail?.hospitalId;
            this.visitType =
              res?.result?.sectionA?.establishmentDetail?.isOwner;
            // if(this.visitType==false){
            //   this.mapLocation.get('locality').disable()
            //   this.mapLocation.get('pinCode').disable();
            //   }
            //  this.getEditDetail?.forEach((res:any)=>{
            if (this.getEditDetail?._id == this.data?.id) {
              for (let i = 0; i <= res?.specialization?.length; i++) {
                this.arr?.push(res?.specialization[i]?.name);
              }
              let filter = this.OccupationList?.filter((el: any) =>
                this.getEditDetail?.sectionA?.basicDetails?.specialization.includes(
                  el.id
                )
              );

              filter?.forEach((res: any) => {
                let obj = {
                  displayValue: res.displayValue,
                  id: res.id,
                };
                this.specialisationValues.push(obj);
              });

              //patching Doctorname form value
              this.docorName.patchValue({
                name: this.getEditDetail?.sectionA?.basicDetails?.fullName,
                mobile: this.getEditDetail?.sectionA?.basicDetails?.phone,
                gender: this.getEditDetail?.sectionA?.basicDetails?.gender,
                specialization: this.specialisationValues,
              });

              //patching registration form value
              this.registration.patchValue({
                regNumber:
                  this.getEditDetail?.sectionA?.medicalRegistration[0]
                    ?.registrationNumber,
                regCouncil:
                  this.getEditDetail?.sectionA?.medicalRegistration[0]?.council,
                regYear: parseInt(
                  this.getEditDetail?.sectionA?.medicalRegistration[0]?.year
                ),
              });
              //patching educationDetail form value

              // let degree = res?.education?.find((item:any) => item.degree == res?.education[0]?.degree);

              this.educationDetail.patchValue({
                degree:
                  this.getEditDetail?.sectionA?.education?.education[0]?.degree,
                college:
                  this.getEditDetail?.sectionA?.education?.education[0]
                    ?.college,
                completionYear: parseInt(
                  this.getEditDetail?.sectionA?.education?.education[0]?.year
                ),
                experienceYear: parseInt(
                  this.getEditDetail?.sectionA?.education?.experience
                ),
              });

              //patching educationDetail form value

              this.connectPractice.patchValue({
                establishment:
                  this.getEditDetail?.sectionA?.establishmentDetail?.isOwner,
              });
              //patching establishment values

              this.establishmentDetail.patchValue({
                // estName:this.getEditDetail?.sectionA?.establishmentDetail?.name,
                estType:
                  this.getEditDetail?.sectionA?.establishmentDetail
                    ?.establishmentTypeId,
              });
              this.myControls.setValue(
                this.getEditDetail?.sectionA?.establishmentDetail?.name
              );
              this.searchAddress =
                this.getEditDetail?.sectionC?.address?.street;
              this.mapLocation.patchValue({
                street: this.getEditDetail?.sectionC?.address?.street,
                locality: this.getEditDetail?.sectionC?.address?.locality,
                state: this.getEditDetail?.sectionC?.address?.stateId,
                // city: this.getEditDetail?.sectionC?.address?.city,
                pinCode: this.getEditDetail?.sectionC?.address?.pincode,
              });

              this.searchCity = this.getEditDetail?.sectionC?.address?.city;
              (this.lat =
                this.getEditDetail?.sectionC?.location?.coordinates[1]),
                (this.lng =
                  this.getEditDetail?.sectionC?.location?.coordinates[0]);
              location: {
                coordinates: [
                  this.getEditDetail?.sectionC?.location?.coordinates[1],
                  this.getEditDetail?.sectionC?.location?.coordinates[0],
                ];
              }
            }
            //  })
          });
      }
    } else if (this.data?.hospitallist == true) {
      if (this.data?.data == "Edit") {
        let param = {
          hospitalId: this.data?.id,
        };
        this.apiservice
          .GetData(URLConstant.addHospital, param)
          .subscribe((res: any) => {
            this.hospitalListed = res?.result;
            console.log(this.hospitalListed);
            this.searchCity = this.hospitalListed?.address?.city;
            this.hospitalEstablishment.patchValue({
              // name:this.hospitalListed?.hospitalName,
              type: this.hospitalListed?.hospitalTypeId,
              mobile: this.hospitalListed?.phone,
            });
            this.myControl.setValue(this.hospitalListed?.hospitalName);
            this.lat = this.hospitalListed?.location?.coordinates[1];
            this.lng = this.hospitalListed?.location?.coordinates[0];
            this.searchAddress = this.hospitalListed?.address?.landmark;
            this.mapLocation.patchValue({
              street: this.hospitalListed?.address?.landmark,
              locality: this.hospitalListed?.address?.locality,
              state: this.hospitalListed?.address?.stateId,
              // city: this.hospitalListed?.address?.city,
              pinCode: this.hospitalListed?.address?.pincode,
            });
            // location: {
            //   coordinates: [ this.hospitalListed?.location?.coordinates[0],this.hospitalListed?.location?.coordinates[1]]
            // }
          });
      }
    }
  }

  specializationList() {
    this.apiservice
      .GetData(URLConstant?.specialization, "")
      .subscribe((res: any) => {
        this.OccupationList = res.result?.data;
        if (this.OccupationList && this.OccupationList.length > 0) {
          this.OccupationList?.forEach((el: any) => {
            el.displayValue = el?.name;
            el.id = el?._id;
          });
        }
        this.editDoctorDetail();
      });
  }

  // degreeList() {
  //   this.apiservice.GetData(URLConstant.degree, '').subscribe((res: any) => {
  //     this.getdegreeList = res.result
  //   })
  // }
  // collegeList() {
  //   this.apiservice.GetData(URLConstant.college, '').subscribe((res: any) => {
  //     this.getCollegeList = res.result
  //   })
  // }
  onItemSelect(item: any) {
    console.log(item);
    console.log(this.OccupationList);
  }
  onSelectAll(items: any) {
    console.log(items);
  }
  typeOfHospitalList() {
    this.apiservice
      .GetData(URLConstant.masterData, "")
      .subscribe((res: any) => {
        this.typeOfHospital = res?.result?.data;
      });
  }
  getState() {
    this.apiservice.GetData(URLConstant.state, "").subscribe((res: any) => {
      this.stateList = res?.result?.data;
    });
  }
  dataSourceHospital: any;
  getHospitalList: any = [];
  establishmentLists() {
    this.apiservice.GetData(URLConstant.visitHospital, "").subscribe(
      (res: any) => {
        this.dataSourceHospital = res?.result?.data;
        console.log("find", this.dataSourceHospital);
        for (let i = 0; i < this.dataSourceHospital.length; i++) {
          this.getHospitalList.push(
            this.dataSourceHospital[i]?.hospitalName +
              "," +
              this.dataSourceHospital[i]?.address?.landmark +
              "," +
              this.dataSourceHospital[i]?.address?.locality +
              "," +
              this.dataSourceHospital[i]?.address?.cityName +
              "," +
              this.dataSourceHospital[i]?.address?.state
          );
        }
      },
      (error) => {
        this.toastr.error(error.message);
      }
    );
  }
  myControl = new UntypedFormControl("");
  options: string[] = this.getHospitalList;
  filteredOptions!: Observable<string[]>;

  filterAutoComplete() {
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(""),
      map((value: any) => this._filter(value || ""))
    );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.options.filter((option) =>
      option.toLowerCase().includes(filterValue)
    );
  }
  myControls = new UntypedFormControl("");
  option: string[] = this.getHospitalList;
  filteredOption!: Observable<string[]>;

  filterAutoCompletes() {
    this.filteredOption = this.myControls.valueChanges.pipe(
      startWith(""),
      map((value: any) => this._filters(value || ""))
    );
  }

  private _filters(value: string): string[] {
    const filterValue = value.toLowerCase();
    console.log("hello", filterValue);
    return this.options.filter((option) =>
      option.toLowerCase().includes(filterValue)
    );
  }

  @ViewChild("search") public searchElementRef!: ElementRef;
  ngAfterViewInit() {
    // const autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement);
    // autocomplete.addListener('place_changed', () => {
    //   const place = autocomplete.getPlace();
    //   console.log('Selected Place:', place);
    //   // Do something with the selected place
    // });
    // this.mapsAPILoader.load().then(() => {
    //   let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement);
    //   autocomplete.addListener("place_changed", () => {
    //     this.ngZone.run(() => {
    // some details
    // let place: google.maps.places.PlaceResult = autocomplete.getPlace();
    // console.log(place)
    // this.address = place.formatted_address;
    // this.web_site = place.website;
    // this.name = place.name;
    // this.zip_code = place.address_components[place.address_components.length - 1].long_name;
    // //set latitude, longitude and zoom
    // this.latitude = place.geometry.location.lat();
    // this.longitude = place.geometry.location.lng();
    //       // this.zoom = 12;
    //     });
    //   });
    // });
  }
  searchAddress: any;
  autocompleteResults: any = [];
  // geocoder!: google.maps.Geocoder;

  search() {
    if (this.searchAddress === "") {
      this.autocompleteResults = [];
      return;
    }

    this.mapsAPILoader.load().then(() => {
      console.log(google.maps);
      const autocompleteService = new google.maps.places.AutocompleteService();
      autocompleteService.getPlacePredictions(
        { input: this.searchAddress },
        (predictions: any, status: any) => {
          this.ngZone.run(() => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
              this.autocompleteResults = predictions;
              console.log("aa", this.autocompleteResults);
            } else {
              this.autocompleteResults = [];
            }
          });
        }
      );
    });
  }
  searchCities() {
    if (this.searchCity === "") {
      this.autocompleteResults = [];
      return;
    }

    this.mapsAPILoader.load().then(() => {
      console.log(google.maps);
      const autocompleteService = new google.maps.places.AutocompleteService();
      autocompleteService.getPlacePredictions(
        { input: this.searchCity },
        (predictions: any, status: any) => {
          this.ngZone.run(() => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
              this.autocompleteResults = predictions;
              console.log("ab ", this.autocompleteResults);
            } else {
              this.autocompleteResults = [];
            }
          });
        }
      );
    });
  }

  placedArray: any;
  postalCode: any;
  placeService: any;

  getAddressComponents(placeId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.placeService.getDetails(
        { placeId: placeId },
        (place: any, status: any) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place) {
            resolve(place);
          } else {
            reject(status);
          }
        }
      );
    });
  }

  getAddressDetail(data: any, result: any) {
    console.log(data);
    console.log(result);
    this.searchAddress = result?.structured_formatting?.main_text;
    let mapMovedetail: any;

    this.getAddressComponents(result?.place_id).then((res: any) => {
      this.lat = res.geometry.location.lat();
      this.lng = res.geometry.location.lng();
    });

    this.postalCode = "";
    const geocoder = new google.maps.Geocoder();
    const address = data;

    geocoder.geocode({ address }, (results: any, status: any) => {
      if (status === google.maps.GeocoderStatus.OK) {
        if (results[0]) {
          const postalCodeComponent = results[0].address_components.find(
            (component: any) => component.types.includes("postal_code")
          );

          if (postalCodeComponent) {
            this.postalCode = postalCodeComponent.long_name;
            console.log("Postal Code:", this.postalCode);
            // Do something with the postal code
          } else {
            console.log("Postal code not found for the given address.");
          }
        } else {
          console.log("No results found for the given address.");
        }
      } else {
        console.log("Geocoding failed due to:", status);
      }
    });

    this.placedArray = data.split(",");
    let statedata = this.stateList.find(
      (el: any) =>
        el?.name?.toLowerCase() ==
        this.placedArray[this.placedArray.length - 2]?.toLowerCase()?.trim()
    );
    this.mapLocation.patchValue({
      street: "",
    });
    setTimeout(() => {
      console.log("ppppp", this.postalCode);

      this.mapLocation.patchValue({
        street: data,
        locality: this.placedArray[this.placedArray.length - 4],
        state: statedata?._id,
        // city: this.placedArray[this.placedArray.length - 3],
        pinCode: this.postalCode,
      });
      this.searchCity = this.placedArray[this.placedArray.length - 3];
    }, 300);
  }

  selectAddress(result: any) {
    // Perform actions based on the selected address
    console.log(result?.formatted_address);
    // You can update the selected address in the component or emit it as an event to the parent component
  }
  visitEstablishment(type: any) {
    if (type == false) {
      this.visitType = false;
    } else if (type == true) {
      this.visitType = true;
    }
  }

  getVisitEstablishment(event: any) {
    if (this.visitType == false) {
      let data = {
        search: event.target.value,
      };
      this.apiservice
        .GetData(URLConstant.visitHospital, data)
        .pipe(debounceTime(1000), distinctUntilChanged())
        .subscribe((res: any) => {
          console.log("res", res);
        });
    }
  }

  filledDetil: any;
  hospitalIds: any;
  getEstablismentDeatil(event: any) {
    const text = event?.srcElement?.innerText;
    const parts = text.split(",");

    const hospitalNames = parts[0].trim();

    if (this.visitType == false) {
      this.filledDetil = this.dataSourceHospital.find(
        (el: any) =>
          el?.hospitalName.toLowerCase().trim() ==
          hospitalNames.toLowerCase().trim()
      );
      this.hospitalIds = this.filledDetil?.hospitalId;

      this.establishmentDetail.patchValue({
        estType: this.filledDetil?.hospitalTypeiD,
      });
      this.searchAddress = this.filledDetil?.address?.landmark;
      this.mapLocation.patchValue({
        // street:this.filledDetil?.address?.landmark,
        locality: this.filledDetil?.address?.locality,
        state: this.filledDetil?.address?.stateId,
        pinCode: this.filledDetil?.address?.pincode,
      });
      this.searchCity = this.filledDetil?.address?.cityName;
      (this.lng = this.filledDetil?.location?.coordinates[0]),
        (this.lat = this.filledDetil?.location?.coordinates[1]);
    }
  }

  registerDetail: boolean = false;
  checkExistNumber() {
    let param = {
      phone: this.docorName?.value?.mobile,
      userType: 2,
      isEdit: this.data?.data == "Add New" ? false : true,
    };
    this.apiservice.Postdata(URLConstant.checkExistNumber, param, "").subscribe(
      (res: any) => {
        if (res?.success == true) {
          console.log("true1");
          this.registerDetail = true;
        }
      },
      (error) => {
        console.log("hello");
        this.registerDetail = false;
        this.addDoctor = true;
      }
    );
  }
  registerHospitalDetail: boolean = false;
  checkExistNumberHospital() {
    let param = {
      phone: this.hospitalEstablishment?.value?.mobile,
      userType: 3,
      isEdit: this.data?.data == "Add New" ? false : true,
    };
    this.apiservice.Postdata(URLConstant.checkExistNumber, param, "").subscribe(
      (res: any) => {
        if (res?.success == true) {
          this.registerHospitalDetail = true;
        }
      },
      (error) => {
        console.log("hello1");
        this.registerHospitalDetail = false;
        this.newEstablishment = true;
        this.location = false;
      }
    );
  }
  markers: any = [];
  mapClicked($event: MouseEvent) {
    this.mapsAPILoader.load().then(() => {
      const geocoder = new google.maps.Geocoder();
      const latLng = new google.maps.LatLng(
        $event.coords.lat,
        $event.coords.lng
      );

      geocoder.geocode({ location: latLng }, (results: any, status: any) => {
        if (status === "OK") {
          if (results[0]) {
            const placeId = results[0];
            let mapMovedetail: any;

            this.getAddressComponents(results[0]?.place_id).then((res: any) => {
              mapMovedetail = res?.address_components;
              let statedata = this.stateList.find(
                (el: any) =>
                  el?.name?.toLowerCase() ==
                  mapMovedetail[4]?.long_name?.toLowerCase()?.trim()
              );
              this.searchAddress = mapMovedetail[0]?.long_name;
              this.mapLocation.patchValue({
                locality: mapMovedetail[1]?.long_name,
                state: statedata?._id,
                pinCode: mapMovedetail[6]?.long_name,
              });
              this.searchCity = mapMovedetail[2]?.long_name;
              this.lat = res.geometry.location.lat();
              this.lng = res.geometry.location.lng();
            });

            // this.getAddressDetail('', results[0])
            console.log("placeId", placeId);
            // Do further processing with the placeId
          } else {
            console.log("No results found");
          }
        } else {
          console.log("Geocoder failed due to: " + status);
        }
      });
    });

    this.lat = $event.coords.lat;
    this.lng = $event.coords.lng;
  }
  clearMap() {
    this.mapLocation.reset();
    this.searchAddress = "";
    this.searchCity = "";
  }
  disableMapForm() {
    if (this.visitType == false) {
      this.mapLocation.get("locality").disable();
      this.mapLocation.get("pinCode").disable();
    } else if (this.visitType == true) {
      this.establishmentDetail.reset();
      this.mapLocation.reset();
      this.searchAddress = "";
      this.searchCity = "";
    }
  }

  generateYearList(start: number) {
    const array = [];
    const lastyear = new Date(new Date().setFullYear(1950)).getFullYear();
    for (let i = start; i >= lastyear; i--) {
      array.push(i);
    }
    return array;
  }
  yearList: any = this.generateYearList(new Date().getFullYear());
}

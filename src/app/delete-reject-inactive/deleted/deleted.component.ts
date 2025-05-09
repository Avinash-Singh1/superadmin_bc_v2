import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { Subject, Subscription, debounceTime, distinctUntilChanged, fromEvent, takeUntil } from 'rxjs';

import { log } from 'console';
import { AddNewDoctorComponent } from 'src/app/dialogs/add-new-doctor/add-new-doctor.component';
import { ApiService } from 'src/app/shared/api.service';
import { URLConstant } from 'src/app/apisURL/url';
import { GlobalsearchService } from 'src/app/shared/globalsearch.service';
import { DeleteUserService } from 'src/app/services/delete-user.service';
export interface PeriodicElement {
  name: string;
  position: string;
  gender: string;
  symbol: string;
  degree: string;
  mobile: number;
  email: string;
  age: number
  date: number;
  bloodgroup: string;

}

const ELEMENT_DATA: PeriodicElement[] = [
  { position: 'assets/images/png/ateeqahmad.jpg', name: 'Dr. Tarun juneza', gender: 'Male', symbol: 'Mathura', degree: 'BDS', mobile: 9636000032, email: 'pp@gmail.com', age: 26, date: 21 / 12 / 22, bloodgroup: 'A+' },
  { position: 'assets/images/png/ateeqahmad.jpg', name: 'Dr.Vikas', gender: 'Female', symbol: 'Mathura', degree: 'BDS', mobile: 9636000032, email: 'pp@gmail.com', age: 27, date: 21 / 12 / 22, bloodgroup: 'A+' },
  { position: 'assets/images/png/ateeqahmad.jpg', name: 'Dr.Deepak', gender: 'Male', symbol: 'Mathura', degree: 'BDS', mobile: 9636000032, email: 'pp@gmail.com', age: 22, date: 21 / 12 / 22, bloodgroup: 'A+' },
  { position: 'assets/images/png/ateeqahmad.jpg', name: 'Dr. Jim', gender: 'Female', symbol: 'Mathura', degree: 'BDS', mobile: 9636000032, email: 'pp@gmail.com', age: 25, date: 21 / 12 / 22, bloodgroup: 'A+' },
  { position: 'assets/images/png/ateeqahmad.jpg', name: 'Dr. Boron', gender: 'Male', symbol: 'Mathura', degree: 'BDS', mobile: 9636000032, email: 'pp@gmail.com', age: 28, date: 21 / 12 / 22, bloodgroup: 'A+' },
  { position: 'assets/images/png/ateeqahmad.jpg', name: 'Dr. Deepak', gender: 'Female', symbol: 'Mathura', degree: 'BDS', mobile: 9636000032, email: 'pp@gmail.com', age: 32, date: 21 / 12 / 22, bloodgroup: 'A+' },
  { position: 'assets/images/png/ateeqahmad.jpg', name: 'Dr. Vikas', gender: 'Male', symbol: 'Mathura', degree: 'BDS', mobile: 9636000032, email: 'pp@gmail.com', age: 34, date: 21 / 12 / 22, bloodgroup: 'A+' },
  { position: 'assets/images/png/ateeqahmad.jpg', name: 'Dr. Tarun', gender: 'Female', symbol: 'Mathura', degree: 'BDS', mobile: 9636000032, email: 'pp@gmail.com', age: 29, date: 21 / 12 / 22, bloodgroup: 'A+' },
  { position: 'assets/images/png/ateeqahmad.jpg', name: 'Dr. Deepak', gender: 'Male', symbol: 'Mathura', degree: 'BDS', mobile: 9636000032, email: 'pp@gmail.com', age: 30, date: 21 / 12 / 22, bloodgroup: 'A+' },
  { position: 'assets/images/png/ateeqahmad.jpg', name: 'Dr. Neon', gender: 'Male', symbol: 'Mathura', degree: 'BDS', mobile: 9636000032, email: 'pp@gmail.com', age: 22, date: 21 / 12 / 22, bloodgroup: 'A+' },
];
@Component({
  selector: 'app-deleted',
  templateUrl: './deleted.component.html',
  styleUrls: ['./deleted.component.scss']
})
export class DeletedComponent implements OnInit {

  displayedColumns: string[] = ['position', 'date', 'name', 'Gender', 'Address', 'Mobile', 'BloodGroup'];
  displayedPatientsColumns: string[] = ['image', 'date', 'name', 'gender', 'address', 'mobile', 'email', 'age', 'blood', 'status']
  dataSource = ELEMENT_DATA;
  hospital: boolean = false;
  age: boolean = false;
  bloodGroup: boolean = false;
  isChecked: any = false;
  doctorsList: boolean = true;
  hospitalsList: boolean = false;
  patientList: boolean = false;
  toggle = new UntypedFormControl();
  getToggleEvent: boolean = true;
  getTogglehospital: boolean = true
  patientListData: any;
  patientLength: any;
  page = 1;
  itemPerPage = 10;
  doctorPage = 1;
  hospitalPage = 1;
  itemPerPageDoctor = 10;
  itemPerPageHospital = 10

  doctorListData: any;
  doctorLength: any;
  hospitalListData: any;
  hospitalLength: any
  specialization = ['Dental', 'Orthopaedics', 'General Surgery', 'ENT', 'Obstetrics/Gynaecology']
  cities = ['Delhi', 'Ghaziabad', 'Noida', 'Bangalore', 'Gurugram', 'Mumbai', 'Nagpur', 'Kolkata', 'Chennai']
  hospitals = ['Super-speciality', 'Multi-speciality', 'Super-speciality Clinic', 'Multi-speciality Clinic']
  private unsubscriber: Subject<void> = new Subject<void>();



  constructor(
    private dialog: MatDialog,
    private location: Location,
    private fb: UntypedFormBuilder,
    public apiService: ApiService,
    public deleteUserService:DeleteUserService,
    public globalSearch: GlobalsearchService
  ) { }


  ngOnInit(): void {
    this.deletedUsers();
    this.getSearchKey();
  }
  // ngOnDestroy(): void {
  //   this.unsubscriber.next();
  //   this.unsubscriber.complete();
  // }

  // changeGender( type:any){
  //   if(type=='hospital')   { this.hospital=!this.hospital}
  //   else if(type=='age') {this.age=!this.age;}
  //   else if(type=='bloodGroup') {this.bloodGroup=!this.bloodGroup;}
  // }
  fullNameASC: boolean = true;
  ageASC:boolean=true;
  ageDESC:boolean=false
  fullNameDESC: boolean = false;
  deletedDoctorASC:boolean = true;
  deletedDoctorDESC:boolean = false;
  deletedDoctorLocalityASC:boolean = true;
  deletedDoctorLocalityDESC:boolean = false;
  deletedHospitalASC:boolean=true;
  deletedHospitalDESC:boolean=false;
  deletedHospitalLocalityASC:boolean=true;
  deletedHospitalLocalityDESC:boolean=false
  sortBy: any = {
     sortOrder: '', sort: '' 
  };

    sortData(sort: any) {
    this.page = 1;
    this.doctorPage = 1;
  this.hospitalPage=1;
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
    // switch (true) {

    //   case (sortkey == 'fullName'):
    //     this.sortBy = sortOrder == "ASC" ? { sortOrder: 'ASC', sort: 'patientName' } : sortOrder == "DESC" ? { sortOrder: 'DESC', sort: 'patientName' } : { sortOrder: '' }
    //     this.fullNameASC = sortOrder == 'ASC' ? false : true;
    //     this.fullNameDESC = sortOrder == 'DESC' ? false : true
    //     this.deletedUsers();
    //     break;

    
    //   case (sortkey == 'age'):
    //     this.sortBy = sortOrder == "ASC" ? { sortOrder: 'ASC', sort: 'age' } : sortOrder == "DESC" ? { sortOrder: 'DESC', sort: 'age' } : { sortOrder: '' }
    //     this.ageASC = sortOrder == 'ASC' ? false : true;
    //     this.ageDESC = sortOrder == 'DESC' ? false : true
    //     this.deletedUsers();
    //     break;

    //       case (sortkey == 'deletedDoctor'):
    //     this.sortBy = sortOrder == "ASC" ? { sortOrder: 'ASC', sort: 'doctorName' } : sortOrder == "DESC" ? { sortOrder: 'DESC', sort: 'doctorName' } : { sortOrder: '' }
    //     this.deletedDoctorASC = sortOrder == 'ASC' ? false : true;
    //     this.deletedDoctorDESC = sortOrder == 'DESC' ? false : true
    //     this.deletedUsers();
    //     break;

    //   case (sortkey == 'deletedDoctorLocality'):
        // this.sortBy = sortOrder == "ASC" ? { sortOrder: 'ASC', sort: 'doctorAddress.city' } : sortOrder == "DESC" ? { sortOrder: 'DESC', sort: 'doctorAddress.city' } : { sortOrder: '' }
    //     this.deletedDoctorLocalityASC = sortOrder == 'ASC' ? false : true;
    //     this.deletedDoctorLocalityDESC = sortOrder == 'DESC' ? false : true
    //     this.deletedUsers();
    //     break;
    
    // case (sortkey == 'deleteHospital'):
    //     this.sortBy = sortOrder == "ASC" ? { sortOrder: 'ASC', sort: 'establishmentName' } : sortOrder == "DESC" ? { sortOrder: 'DESC', sort: 'establishmentName' } : { sortOrder: '' }
    //     this.deletedHospitalASC = sortOrder == 'ASC' ? false : true;
    //     this.deletedHospitalDESC = sortOrder == 'DESC' ? false : true
    //     this.deletedUsers();
    //      break;

    //   case (sortkey == 'deleteHospitalLocality'):
    //     this.sortBy = sortOrder == "ASC" ? { sortOrder: 'ASC', sort: 'address.city' } : sortOrder == "DESC" ? { sortOrder: 'DESC', sort: 'address.city' } : { sortOrder: '' }
    //     this.deletedHospitalLocalityASC = sortOrder == 'ASC' ? false : true;
    //     this.deletedHospitalLocalityDESC = sortOrder == 'DESC' ? false : true
    //     break;
    // }
        this.deletedUsers();

  }
  chnageDoctorList(list: any) {
    if (list == 'doctors') {
      this.doctorsList = true;
      this.hospitalsList = false;
      this.patientList = false;
      this.deletedUsers();
    }
    else if (list == 'hospitals') {
      this.hospitalsList = true;
      this.doctorsList = false;
      this.patientList = false;
      this.deletedUsers();

    }
    else if (list == 'patient') {
      this.patientList = true;
      this.doctorsList = false;
      this.hospitalsList = false;
      this.deletedUsers();

    }

  }
  search: any;
  subscription!: Subscription;

  getSearchKey() {
    this.subscription = this.globalSearch.getSearchValue().pipe(
      debounceTime(500), distinctUntilChanged()
    ).subscribe((data: any) => {
      this.search = data
      this.deletedUsers();
    })
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  deletedUsers() {
    let data: any = {
      page: this.doctorsList == true ? this.page : this.hospitalsList == true ? this.doctorPage : this.patientList == true ? this.hospitalPage : '',
      size: this.doctorsList == true ? this.itemPerPage : this.hospitalsList == true ? this.itemPerPageDoctor : this.patientList == true ? this.itemPerPageHospital : '',
      status: 1,
      search: this.search
    }
    let status={...data,...this.sortBy};
    Object.keys(status).forEach(key => {
      if (status[key] === null || status[key] === undefined || status[key] === "") {
        delete status[key];
      }
    });
    this.apiService.GetData(URLConstant.deletedpatientDoctorHospital, status).subscribe((res: any) => {
      this.patientListData = res?.result?.patient?.data
      this.doctorListData = res?.result?.doctor?.data
      this.hospitalListData = res?.result?.hospital?.data
      console.log("patientListData: ",this.patientListData);
      console.log("doctorListData: ",this.doctorListData);
      console.log("hospitalListData: ",this.hospitalListData);
      this.patientLength = res?.result?.patient?.count
      this.doctorLength = res?.result?.doctor?.count
      this.hospitalLength = res?.result?.hospital?.count
      for (let i = 0; i < this.patientListData.length; i++) {
        this.patientListData[i]['name'] = this.patientListData[i]?.patientName?.split(' ');
      }
      for (let i = 0; i < this.doctorListData.length; i++) {
        this.doctorListData[i]['name'] = this.doctorListData[i]?.doctorName?.split(' ');
      }
      for (let i = 0; i < this.hospitalListData.length; i++) {
        this.hospitalListData[i]['name'] = this.hospitalListData[i]?.establishmentName?.split(' ');
      }
    })
  }

  // toggleCheckboxdoctors(event:any){
  //   this.getToggleEvent=event.target.checked
  // }
  // toggleCheckboxhospitalss(event:any){
  //   this.getTogglehospital=event.target.checked

  // }
  updatePageNumer(event: any) {
    this.page = event;
    this.deletedUsers()
  }

  updateDoctorPage(event: any) {
    this.doctorPage = event;
    this.deletedUsers()
  }
  updateHospitalPage(event: any) {
    this.hospitalPage = event;
    this.deletedUsers()
  }

  DeletepatientList(element:any){

    this.deleteUserService.DeletepatientList(element).subscribe({
      next: (res) => {
        console.log('User deleted:', res);
        setTimeout(() => {
          this.deletedUsers();
        }, 1000);
      },
      error: (err) => {
        console.error('Error deleting user:', err);
      }
    });
    
  }
  DeletedoctorList(element:any){

    this.deleteUserService.DeleteDoctorList(element).subscribe({
      next: (res) => {
        console.log('User deleted:', res);
        setTimeout(() => {
          this.deletedUsers();
        }, 1000);
      },
      error: (err) => {
        console.error('Error deleting user:', err);
      }
    });
    
  }

//   this.deleteUserService.deleteUser(userId).subscribe({
//   next: (res) => {
//     console.log('User deleted:', res);
//   },
//   error: (err) => {
//     console.error('Error deleting user:', err);
//   }
// });

}

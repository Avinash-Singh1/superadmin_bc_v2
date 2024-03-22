import { Component, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { log } from 'console';
import { ToastrService } from 'ngx-toastr';
import { Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { URLConstant } from 'src/app/apisURL/url';
import { AddNewDoctorComponent } from 'src/app/dialogs/add-new-doctor/add-new-doctor.component';
import { ViewDoctorHospitalComponent } from 'src/app/dialogs/view-doctor-hospital/view-doctor-hospital.component';
import { ApiService } from 'src/app/shared/api.service';
import { GlobalsearchService } from 'src/app/shared/globalsearch.service';
export interface PeriodicElement {
  position: string;
  name: string;
  symbol: string;
  gender:string;
  degree:string;
  mobile:number;
  email:string;
  age:number;
  date:number;
  bloodgroup:string;

}

const ELEMENT_DATA: PeriodicElement[] = [
  {position:'assets/images/png/ateeqahmad.jpg', name: 'Dr. Tarun juneza', gender: 'Male', symbol: 'Mathura',degree:'BDS',mobile:9636000032,email:'pp@gmail.com',age:26,date:21/12/22,bloodgroup:'A+'},
  {position: 'assets/images/png/ateeqahmad.jpg', name: 'Dr.Vikas', gender: 'Female', symbol: 'Mathura',degree:'BDS',mobile:9636000032,email:'pp@gmail.com',age:27,date:21/12/22,bloodgroup:'A+'},
  {position: 'assets/images/png/ateeqahmad.jpg', name: 'Dr.Deepak', gender: 'Male', symbol: 'Mathura',degree:'BDS',mobile:9636000032,email:'pp@gmail.com',age:22,date:21/12/22,bloodgroup:'A+'},
  {position: 'assets/images/png/ateeqahmad.jpg', name: 'Dr. Jim', gender: 'Female', symbol: 'Mathura',degree:'BDS',mobile:9636000032,email:'pp@gmail.com',age:25,date:21/12/22,bloodgroup:'A+'},
  {position: 'assets/images/png/ateeqahmad.jpg', name: 'Dr. Boron', gender: 'Male', symbol: 'Mathura',degree:'BDS',mobile:9636000032,email:'pp@gmail.com',age:28,date:21/12/22,bloodgroup:'A+'},
  {position: 'assets/images/png/ateeqahmad.jpg', name: 'Dr. Deepak', gender: 'Female', symbol: 'Mathura',degree:'BDS',mobile:9636000032,email:'pp@gmail.com',age:32,date:21/12/22,bloodgroup:'A+'},
  {position: 'assets/images/png/ateeqahmad.jpg', name: 'Dr. Vikas', gender: 'Male', symbol: 'Mathura',degree:'BDS',mobile:9636000032,email:'pp@gmail.com',age:34,date:21/12/22,bloodgroup:'A+'},
  {position: 'assets/images/png/ateeqahmad.jpg', name: 'Dr. Tarun', gender: 'Female', symbol: 'Mathura',degree:'BDS',mobile:9636000032,email:'pp@gmail.com',age:29,date:21/12/22,bloodgroup:'A+'},
  {position: 'assets/images/png/ateeqahmad.jpg', name: 'Dr. Deepak', gender: 'Male', symbol: 'Mathura',degree:'BDS',mobile:9636000032,email:'pp@gmail.com',age:30,date:21/12/22,bloodgroup:'A+'},
  {position: 'assets/images/png/ateeqahmad.jpg', name: 'Dr. Neon', gender: 'Male', symbol: 'Mathura',degree:'BDS',mobile:9636000032,email:'pp@gmail.com',age:22,date:21/12/22,bloodgroup:'A+'},
];
@Component({
  selector: 'app-rejected',
  templateUrl: './rejected.component.html',
  styleUrls: ['./rejected.component.scss']
})
export class RejectedComponent implements OnInit {

  displayedColumns: string[] = ['position', 'date','name', 'specialization', 'Address','Mobile','document','status'];
  displayedhospitalColumns: string[] = ['position', 'date','name', 'typeOf', 'Address','Mobile','document','status'];
  search: any;
  subscription!: Subscription;
  dataSource: any;
  hospital:boolean=false;
  age:boolean=false;
  bloodGroup:boolean=false;
  isChecked:any=false;
  doctorsList:boolean=true;
  hospitalsList:boolean=false;
  totalLength:any;
  page=1;
  itemPerPage=10;
  hospitalPage=1;
  HospitalItemPerPage=10
  toggle=new UntypedFormControl();
  getToggleEvent:boolean=true;
  getTogglehospital:boolean=true;
  rejectedDoctorList:any;
  rejectedHospitalList:any;
  rejectedDoctorLength:any;
  rejectedHospitalLength:any
  specialization=['Dental','Orthopaedics','General Surgery','ENT','Obstetrics/Gynaecology']
  cities=['Delhi','Ghaziabad','Noida','Bangalore','Gurugram','Mumbai','Nagpur','Kolkata','Chennai']
  hospitals=['Super-speciality','Multi-speciality','Super-speciality Clinic','Multi-speciality Clinic']
  


  constructor(
    private dialog:MatDialog,
    private apiservice:ApiService,
    private toastr:ToastrService,
    public globalSearch: GlobalsearchService

    ) { }

  ngOnInit(): void {
    this.RejectedList();
    this.getSearchKey();

  }
  
  changeGender( type:any){
    if(type=='hospital')   { this.hospital=!this.hospital}
    else if(type=='age') {this.age=!this.age;}
    else if(type=='bloodGroup') {this.bloodGroup=!this.bloodGroup;}


  }
 
  fullNameASC: boolean = true;
  fullNameDESC: boolean = false;
  ageASC:boolean=true;
  ageDESC:boolean=false
  deletedDoctorASC:boolean = true;
  deletedDoctorDESC:boolean = false;
  deletedDoctorLocalityASC:boolean = true;
  deletedDoctorLocalityDESC:boolean = false;
  sortBy: any = {
    sortOrder:"",
    sort:""
  };


    sortData(sort: any,) {
    this.page = 1;
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
    this.RejectedList();
    // switch (true) {

    //   case (sortkey == 'fullName'):
    //     this.sortBy = sortOrder == "ASC" ? { sortOrder: 'ASC', sort: 'doctorName' } : sortOrder == "DESC" ? { sortOrder: 'DESC', sort: 'doctorName' } : { sortOrder: '' }
    //     this.fullNameASC = sortOrder == 'ASC' ? false : true;
    //     this.fullNameDESC = sortOrder == 'DESC' ? false : true
    //     this.RejectedList();
    //     break;

    
    //   case (sortkey == 'locality'):
    //     this.sortBy = sortOrder == "ASC" ? { sortOrder: 'ASC', sort: 'doctorAddress.city' } : sortOrder == "DESC" ? { sortOrder: 'DESC', sort: 'doctorAddress.city' } : { sortOrder: '' }
    //     this.ageASC = sortOrder == 'ASC' ? false : true;
    //     this.ageDESC = sortOrder == 'DESC' ? false : true
    //     this.RejectedList();
    //     break;

    //       case (sortkey == 'rejectedHospital'):
    //     this.sortBy = sortOrder == "ASC" ? { sortOrder: 'ASC', sort: 'establishmentName' } : sortOrder == "DESC" ? { sortOrder: 'DESC', sort: 'establishmentName' } : { sortOrder: '' }
    //     this.deletedDoctorASC = sortOrder == 'ASC' ? false : true;
    //     this.deletedDoctorDESC = sortOrder == 'DESC' ? false : true
    //     this.RejectedList();
    //     break;

    //   case (sortkey == 'rejectedHospitalLocality'):
    //     this.sortBy = sortOrder == "ASC" ? { sortOrder: 'ASC', sort: 'address.city' } : sortOrder == "DESC" ? { sortOrder: 'DESC', sort: 'address.city' } : { sortOrder: '' }
    //     this.deletedDoctorLocalityASC = sortOrder == 'ASC' ? false : true;
    //     this.deletedDoctorLocalityDESC = sortOrder == 'DESC' ? false : true
    //     this.RejectedList();
    //     break;
    // }

  }
  chnageDoctorList(list:any){
    if(list=='doctors') {
      this.doctorsList=true;
      this.hospitalsList=false;
      this.RejectedList();
    }  
    else if(list =='hospitals'){
      this.hospitalsList=true;
      this.doctorsList=false;
      this.RejectedList();
    }
    
  }
  toggleCheckboxdoctors(event:any){
    this.getToggleEvent=event.target.checked
  }
  toggleCheckboxhospitalss(event:any){
    this.getTogglehospital=event.target.checked
    
  }

  viewRejectedDoctor(type:any,id:any){
    const dialogRef = this.dialog.open(ViewDoctorHospitalComponent, {
      maxHeight: '100vh',
      width: '720px',
      panelClass: 'yespost',
      data:{
        value:type,
        viewId:id
      }
     
    });
  }
 
  getSearchKey() {
    this.subscription = this.globalSearch.getSearchValue().pipe(
      debounceTime(500), distinctUntilChanged()
    ).subscribe((data: any) => {
      this.search = data
      this.RejectedList();
    })
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();

  }
 RejectedList(){
  let data:any={
    page:this.doctorsList==true?this.page:this.hospitalsList==true?this.hospitalPage:'',
    size:this.doctorsList==true?this.itemPerPage:this.hospitalsList==true?this.HospitalItemPerPage:'',
    status:2,
    search: this.search
  }
  let status={...data,...this.sortBy};
  Object.keys(status).forEach(key => {
    if (status[key] === null || status[key] === undefined || status[key] === "") {
      delete status[key];
    }
  });
  this.apiservice.GetData(URLConstant.deletedpatientDoctorHospital,status).subscribe((res:any)=>{
    this.rejectedDoctorList=res?.result?.doctor?.data
    this.rejectedHospitalList=res?.result?.hospital?.data
    this.rejectedDoctorLength=res?.result?.doctor?.count
    this.rejectedHospitalLength=res?.result?.hospital?.count
    for (let i = 0; i < this.rejectedDoctorList.length; i++) {
      this.rejectedDoctorList[i]['name']=this.rejectedDoctorList[i]?.doctorName?.split(' ');
    }
    for (let i = 0; i < this.rejectedHospitalList.length; i++) {
      this.rejectedHospitalList[i]['name']=this.rejectedHospitalList[i]?.establishmentName?.split(' ');
    }
  })
 }
 updatePage(event: any) {
  this.page = event;
  this.RejectedList()
}
updateHospitalPage(event:any){
  this.hospitalPage = event;
  this.RejectedList()
}
}

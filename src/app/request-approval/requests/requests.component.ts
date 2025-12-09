import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { URLConstant } from 'src/app/apisURL/url';
import { AcceptRejectComponent } from 'src/app/dialogs/accept-reject/accept-reject.component';
import { ViewDoctorHospitalComponent } from 'src/app/dialogs/view-doctor-hospital/view-doctor-hospital.component';
import { ApiService } from 'src/app/shared/api.service';
// export interface PeriodicElement {
//   name: string;
//   position: string;
//   weight: string;
//   symbol: string;
//   degree:string;
//   mobile:number;
//   email:string;
//   date:number;
//   bloodgroup:string;

// }

// const ELEMENT_DATA = [
//   {position:'assets/images/png/ateeqahmad.jpg', name: 'Dr. Tarun juneza', weight: 'Dental', symbol: 'Mathura',degree:'BDS',mobile:9636000032,email:'pp@gmail.com',date:21/12/22,bloodgroup:'A+'},
//   {position: 'assets/images/png/ateeqahmad.jpg', name: 'Dr.Vikas', weight: 'Dental', symbol: 'Mathura',degree:'BDS',mobile:9636000032,email:'pp@gmail.com',date:21/12/22,bloodgroup:'A+'},
//   {position: 'assets/images/png/ateeqahmad.jpg', name: 'Dr.Deepak', weight: 'Dental', symbol: 'Mathura',degree:'BDS',mobile:9636000032,email:'pp@gmail.com',date:21/12/22,bloodgroup:'A+'},
//   {position: 'assets/images/png/ateeqahmad.jpg', name: 'Dr. Jim', weight: 'Dental', symbol: 'Mathura',degree:'BDS',mobile:9636000032,email:'pp@gmail.com',date:21/12/22,bloodgroup:'A+'},
//   {position: 'assets/images/png/ateeqahmad.jpg', name: 'Dr. Boron', weight: 'Dental', symbol: 'Mathura',degree:'BDS',mobile:9636000032,email:'pp@gmail.com',date:21/12/22,bloodgroup:'A+'},
//   {position: 'assets/images/png/ateeqahmad.jpg', name: 'Dr. Deepak', weight: 'Dental', symbol: 'Mathura',degree:'BDS',mobile:9636000032,email:'pp@gmail.com',date:21/12/22,bloodgroup:'A+'},
//   {position: 'assets/images/png/ateeqahmad.jpg', name: 'Dr. Vikas', weight: 'Dental', symbol: 'Mathura',degree:'BDS',mobile:9636000032,email:'pp@gmail.com',date:21/12/22,bloodgroup:'A+'},
//   {position: 'assets/images/png/ateeqahmad.jpg', name: 'Dr. Tarun', weight: 'Dental', symbol: 'Mathura',degree:'BDS',mobile:9636000032,email:'pp@gmail.com',date:21/12/22,bloodgroup:'A+'},
//   {position: 'assets/images/png/ateeqahmad.jpg', name: 'Dr. Deepak', weight: 'Dental', symbol: 'Mathura',degree:'BDS',mobile:9636000032,email:'pp@gmail.com',date:21/12/22,bloodgroup:'A+'},
//   {position: 'assets/images/png/ateeqahmad.jpg', name: 'Dr. Neon', weight: 'Dental', symbol: 'Mathura',degree:'BDS',mobile:9636000032,email:'pp@gmail.com',date:21/12/22,bloodgroup:'A+'},
// ];
@Component({
  selector: 'app-requests',
  templateUrl: './requests.component.html',
  styleUrls: ['./requests.component.scss']
})
export class RequestsComponent implements OnInit {

  displayedColumns: string[] = ['img','date', 'name', 'specialization', 'locality','Mobile','document','Action',];
  displayedHospitalColumns: string[] = ['img','date','name',"DoctorName", 'typeOfHospital','EstabType', 'locality','Mobile','document','Action',];

  dataSource:any;
  dataSourceHospital:any
  hospital:boolean=false;
  age:boolean=false;
  bloodGroup:boolean=false;
  isChecked:any=false;
  doctorsList:boolean=true;
  hospitalsList:boolean=false;
  toggle=new UntypedFormControl();
  getToggleEvent:boolean=true;
  getTogglehospital:boolean=true
  selectAll:boolean=true;
  deselectAll:boolean=false
  selectHospital:boolean=true;
  itemsPerPage: number = 10;
  hospitalItemperPage:number=10
   page=1;
   hospitalPage=1
   search = new UntypedFormControl();
  deselectHospital:boolean=false;
  sortBy: any = {
    order:"",
    sortBy:""
  };
  specialization=['Dental','Orthopaedics','General Surgery','ENT','Obstetrics/Gynaecology']
  cities=['Delhi','Ghaziabad','Noida','Bangalore','Gurugram','Mumbai','Nagpur','Kolkata','Chennai']
  hospitals=['Super-speciality','Multi-speciality','Super-speciality Clinic','Multi-speciality Clinic']
  


  constructor(
    private dialog:MatDialog,
    private apiService:ApiService,
    ) { }

  ngOnInit(): void {
    this.doctorListing('');
    this.hospitalListing('')
    this.search.valueChanges.
    pipe(
      debounceTime(500), distinctUntilChanged()
    ).subscribe(val => this.searchFunction(val)
    )
  }
  
  changeGender( type:any){
    if(type=='hospital')   { this.hospital=!this.hospital}
    else if(type=='age') {this.age=!this.age;}
    else if(type=='bloodGroup') {this.bloodGroup=!this.bloodGroup;}


  }
 
 
  chnageDoctorList(list:any){
    this.sortBy={
      order:"",
      sortBy:""
    }
    if(list=='doctors') {
      this.doctorsList=true;
      this.hospitalsList=false;
      this.search.reset();
    }  
    else if(list =='hospitals'){
      this.hospitalsList=true;
      this.doctorsList=false;
      this.search.reset();

    }
    
  }
  toggleCheckboxdoctors(event:any){
    this.getToggleEvent=event.target.checked
  }
  toggleCheckboxhospitalss(event:any){
    this.getTogglehospital=event.target.checked  
  }

   selects(type:any){  
    var ele:any=document.getElementsByName('checkboxes');  
    for(var i=0; i<ele.length; i++){  
        if(ele[i].type=='checkbox' && type==true)  
        {
            ele[i].checked=true;  
            this.selectAll=false;
            this.deselectAll=true

        }
           else if(ele[i].type=='checkbox' && type==false)  {
            ele[i].checked=false; 
            this.deselectAll=false;
            this.selectAll=true
           }
    }  
}  

selectHospitals(type:any){
  var elem:any=document.getElementsByName('hospital');  
  for(var i=0; i<elem.length; i++){  
      if(elem[i].type=='checkbox' && type==true && elem[i].value==1)  
      {
        console.log(type)
          elem[i].checked=true;  
          this.selectHospital=false;
          this.deselectHospital=true;

      }
         else if(elem[i].type=='checkbox' && type==false && elem[i].value==1)  {
          console.log(type)
          elem[i].checked=false; 
          this.deselectHospital=false;
          this.selectHospital=true
         }
  }  
}
viewDoctor(components:any,value:any,id:any,status:any,type:any){
  if(status=='doctorAccept'){
  let param={
    userId:id
  }
  let status={
    isVerified:2
  }
  this.apiService.patchData(URLConstant.changeDoctorStatus,status,param).subscribe((res:any)=>{
    if(res?.success==true){
      this.doctorListing('')
    }
      })  
  }
  let compo:any=components=='ViewDoctorHospitalComponent'?ViewDoctorHospitalComponent:AcceptRejectComponent

  const dialogRef = this.dialog.open(compo, {
    maxHeight: '100vh',
    width: '720px',
    panelClass: 'view-popup',
    data: {
      reject:value,
      userId:status=='doctorReject'?id:'',
      hospitalId:status=='hospitalReject'?id:'',
      viewId:id,
      value:value,
      userName:type
    }

  });

 if(status=='doctorReject'){
  dialogRef.afterClosed().subscribe((res:any) => {
    let status={
      isVerified:res?.isVerified,
      rejectReason:res?.rejectReason
    }
    let param={
      userId:res?.userId
    }
   if(param.userId!=undefined || param.userId!=null){
    this.apiService.patchData(URLConstant.changeDoctorStatus,status,param).subscribe((res:any)=>{
      if(res?.success==true){
        this.doctorListing('') 
       }
        })  
   }
        })
      }

if(status=='hospitalAccept'){
  let param={
    hospitalId:id
  }
  let status={
    isVerified:2
  }
  this.apiService.patchData(URLConstant.changeStatusHospital,status,param).subscribe((res:any)=>{
    if(res?.success==true){
      this.hospitalListing('')
    }
      })  
}
if(status=='hospitalReject'){
  dialogRef.afterClosed().subscribe((res:any) => {
    let status={
      isVerified:res?.isVerified,
      rejectReason:res?.rejectReason
    }
    let param={
      hospitalId:res?.hospitalId
    }
   if(param.hospitalId!=undefined || param.hospitalId!=null){
    this.apiService.patchData(URLConstant.changeStatusHospital,status,param).subscribe((res:any)=>{
      if(res?.success==true){
        this.hospitalListing('') 
       }
        })  
   }
        })
      }
}
totalLength:any;
totalLengthHospital:any
doctorListing(value:any){
  let data={
    page:this.page,
    size:this.itemsPerPage,
    search:this.search.value
  }
  let param={...data,...this.sortBy}
  Object.keys(param).forEach(key => {
    if (param[key] === null || param[key] === undefined || param[key] === "") {
      delete param[key];
    }
  });
  this.apiService.GetData(URLConstant.doctorApprovalList,param).subscribe((res:any)=>{
this.dataSource=res?.result?.data
this.totalLength=res?.result?.count[0]?.count
for (let i = 0; i < this.dataSource.length; i++) {
  this.dataSource[i]['name']=this.dataSource[i]?.doctorDetails[0]?.fullName?.split(' ');
}
  })
}
getLength:any
hospitalListing(events:any){
    let data={
      page:this.hospitalPage,
      size:this.hospitalItemperPage,
      search:this.search.value
    }
    let param={...data,...this.sortBy}
    Object.keys(param).forEach(key => {
      if (param[key] === null || param[key] === undefined || param[key] === "") {
        delete param[key];
      }
    });
    this.apiService.GetData(URLConstant.viewHospitalApproval,param).subscribe((res:any)=>{
  this.dataSourceHospital=res?.result[0]?.data
  this.getLength=res?.result[0]?.totalCount
  this.totalLengthHospital=res?.result[0]?.totalCount[0]?.count
  for (let i = 0; i < this.dataSourceHospital?.length; i++) {
    this.dataSourceHospital[i]['name']=this.dataSourceHospital[i]?.hospitalName?.split(' ');
  }
    })
  
}
updatePageNumer(event: any) {
  this.page = event;
  this.doctorListing('')
}
updatePageForHospital(event: any){
  this.hospitalPage=event;
  this.hospitalListing('');

}
searchFunction(value: any) {
  this.page = 1;
  this.hospitalPage=1;
  if(this.doctorsList==true){
  this.doctorListing(value);
  }
  else if(this.hospitalsList==true){
    this.hospitalListing(value)
  }

}
fullNameASC:boolean=true;
fullNameDESC:boolean=false;
fullNameHospitalASC:boolean=true;
fullNameHospitalDESC:boolean=false;
sortData(sortBy: any) {
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
    if(this.doctorsList){
      this.doctorListing("")
      return
    }
    this.hospitalListing("")
  // switch (true) {
  //   case (sortkey == 'fullName'):
  //     this.sortBy = sortOrder == "ASC" ? { order: 'ASC', sortBy: 'fullName' } : sortOrder == "DESC" ? { order: 'DESC', sortBy: 'fullName' } : { sortOrder: '' }
  //     if(this.doctorsList==true){
  //     this.fullNameASC = sortOrder == 'ASC' ? false : true;
  //     this.fullNameDESC = sortOrder == 'DESC' ? false : true
  //     this.doctorListing('');
  //     }
  //     else if(this.hospitalsList==true){
  //       this.fullNameHospitalASC = sortOrder == 'ASC' ? false : true;
  //       this.fullNameHospitalDESC = sortOrder == 'DESC' ? false : true
  //       this.hospitalListing('');
  //     }
  //     break;
  // }
}

}

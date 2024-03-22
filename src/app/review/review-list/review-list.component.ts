import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { log } from 'console';
import { ToastrService } from 'ngx-toastr';
import { URLConstant } from 'src/app/apisURL/url';
import { AcceptRejectComponent } from 'src/app/dialogs/accept-reject/accept-reject.component';
import { AddNewDoctorComponent } from 'src/app/dialogs/add-new-doctor/add-new-doctor.component';
import { DeleteReviewComponent } from 'src/app/dialogs/delete-review/delete-review.component';
import { RejectedReviewReasonComponent } from 'src/app/dialogs/rejected-review-reason/rejected-review-reason.component';
import { ViewReviewsComponent } from 'src/app/dialogs/view-reviews/view-reviews.component';
import { ApiService } from 'src/app/shared/api.service';
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
  selector: 'app-review-list',
  templateUrl: './review-list.component.html',
  styleUrls: ['./review-list.component.scss']
})
export class ReviewListComponent implements OnInit {
  displayedApprovedColumns: string[] = ['date', 'review', 'rating', 'detail', 'action'];
  displayedRequestedColumns: string[] = ['date', 'review', 'rating', 'detail', 'action'];
  displayedRejectedColumns: string[] = ['date', 'review', 'rating', 'reason', 'status'];

  dataSource: any;
  hospital: boolean = false;
  age: boolean = false;
  bloodGroup: boolean = false;
  isChecked: any = false;
  doctorsList: boolean = true;
  hospitalsList: boolean = false;
  patientList: boolean = false;
  totalLength: any;
  page: any = 1;
  itemPerPage: any = 10;
  itemPerPageReqested = 10;
  pageRequested = 1
  reviewPointers: any = []
  starArr: any = [];
  requestedStarArr: any = []
  requestedReview: any;
  requestedLength: any;
  rejectedReview: any;
  rejectedLength: any;
  rejectedStarArr: any = []
  pageRejected = 1;
  itemPerPageRejectd = 10
  toggle = new UntypedFormControl();
  getToggleEvent: boolean = true;
  getTogglehospital: boolean = true;
  approvedReview: any;
  // specialization=['Dental','Orthopaedics','General Surgery','ENT','Obstetrics/Gynaecology']
  Stars = [
    {
      count: 5,
      moreValue: '',
      id: 'five',
      selected: false
    },
    {
      count: 4,
      moreValue: '& Up',
      id: 'four',
      selected: false


    },
    {
      count: 3,
      moreValue: '& Up',
      id: 'three',
      selected: false

    },
    {
      count: 2,
      moreValue: '& Up',
      id: 'two',
      selected: false

    },
    {
      count: 1,
      moreValue: '& Up',
      id: 'one',
      selected: false


    },
  ]
  selected=-1
  cities = ['Delhi', 'Ghaziabad', 'Noida', 'Bangalore', 'Gurugram', 'Mumbai', 'Nagpur', 'Kolkata', 'Chennai']
  hospitals = ['Super-speciality', 'Multi-speciality', 'Super-speciality Clinic', 'Multi-speciality Clinic']


  public form: UntypedFormGroup;
  rating3: number
  constructor(
    private dialog: MatDialog,
    private apiservice: ApiService,
    private toastr: ToastrService,
    private fb: UntypedFormBuilder,
  ) {
    this.rating3 = 5;
    this.form = this.fb.group({
      rating1: ['', Validators.required],
      rating2: [[]]
    });
  }

  ngOnInit(): void {
    this.reviewList()
  }

  changeGender(type: any) {
    if (type == 'hospital') { this.hospital = !this.hospital }
    else if (type == 'age') { this.age = !this.age; }
    else if (type == 'bloodGroup') { this.bloodGroup = !this.bloodGroup; }


  }

  fullNameASC: boolean = true;
  fullNameDESC: boolean = false;
  requestedNameASC:boolean=true;
  requestedNameDESC:boolean=false
  rejectedNameASC:boolean = true;
  rejectedNameDESC:boolean = false;
  
  sortBy: any = {
    sortOrder:"",
    sort:""
  };

    sortData(sort: any,) {
    this.page = 1;
  this.pageRequested=1;
  this.pageRejected=1
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
    this.reviewList();
  }
  chnageDoctorList(list: any) {
    this.sortBy = {
      sort:"",
          sortOrder: "",
    }
    if (list == 'doctors') {
      this.doctorsList = true;
      this.hospitalsList = false
      this.patientList = false
      for (let i = 0; i < this.Stars.length; i++) {
        this.Stars[i].selected = false
      }
    }
    else if (list == 'hospitals') {
      this.hospitalsList = true;
      this.doctorsList = false;
      this.patientList = false;
      for (let i = 0; i < this.Stars.length; i++) {
        this.Stars[i].selected = false
      }

    }
    else if (list == 'patient') {
      this.patientList = true
      this.hospitalsList = false;
      this.doctorsList = false;

    }

  }
  toggleCheckboxdoctors(event: any) {
    this.getToggleEvent = event.target.checked
  }
  toggleCheckboxhospitalss(event: any) {
    this.getTogglehospital = event.target.checked

  }

  addDoctor(data: any) {
    const dialogRef = this.dialog.open(AddNewDoctorComponent, {
      maxHeight: '100vh',
      width: '720px',
      panelClass: 'yespost',
      data: {
        data: data,
        doctorlist: this.doctorsList ? true : false,
        hospitallist: this.hospitalsList ? true : false,
      }
    });
  }
   appeovedValue:any=[]
   requestValue:any=[]
 
   data:any;
  reviewList() {
   let  approvedParam;
   let  requestParam;
    this.appeovedValue = [];
    this.requestValue=[]
    this.requestedStarArr=[]
    this.starArr=[]
    this.rejectedStarArr=[]
    
    for(let i=0;i<this.approvedFilter.length;i++){
     this.appeovedValue.push(this.approvedFilter[i]?.value)
    }
    this.requestedFiler.forEach((ele:any)=>{
      this.requestValue.push(ele.value)
    })
    approvedParam=this.appeovedValue.join()
    requestParam=this.requestValue.join()
    let data:any = {
      page: this.doctorsList == true ? this.page : this.hospitalsList == true ? this.pageRequested : this.patientList == true ? this.pageRejected : '',
      size: this.doctorsList == true ? this.itemPerPage : this.hospitalsList == true ? this.itemPerPageReqested : this.patientList == true ? this.itemPerPageRejectd : '',
      status: this.doctorsList == true ? 2 : this.hospitalsList == true ? 1 : this.patientList == true ? 3 : '',
      totalPoint:this.doctorsList == true?this.data1:this.hospitalsList == true?this.data2:''

      // totalPoint:this.doctorsList == true?approvedParam:this.hospitalsList == true?requestParam:''
    }
    let param={...data,...this.sortBy};

    Object.keys(param).forEach(key => {
      if (param[key] === null || param[key] === undefined || param[key] === "") {
        delete param[key];
      }
    });
    this.apiservice.GetData(URLConstant.review, param).subscribe((res: any) => {
      this.totalLength = res?.result?.approvedCount
      this.requestedLength = res?.result?.requestedCount
      this.rejectedLength = res?.result?.rejectedCount

      if (this.doctorsList == true) {
        this.approvedReview = res?.result?.feedbackList?.data
      }
      else if (this.hospitalsList == true) {
        this.requestedReview = res?.result?.feedbackList?.data
      }
      else if (this.patientList == true) {
        this.rejectedReview = res?.result?.feedbackList?.data
      }
      for (let i = 0; i < this.approvedReview?.length; i++) {
        // this.approvedReview[i]['totalPoint'] = Math.round(this.approvedReview[i]['totalPoint'])
        this.starArr.push(this.approvedReview[i]['totalPoint'])
        this.approvedReview[i]['name'] = this.approvedReview[i]?.patientName?.split(' ');
      }
      for (let i = 0; i < this.requestedReview?.length; i++) {
        // this.requestedReview[i]['totalPoint'] = Math.round(this.requestedReview[i]['totalPoint'])
        this.requestedStarArr.push(this.requestedReview[i]['totalPoint'])
        this.requestedReview[i]['name'] = this.requestedReview[i]?.patientName?.split(' ');
      }
      for (let i = 0; i < this.rejectedReview?.length; i++) {
        // this.rejectedReview[i]['totalPoint'] = Math.round(this.rejectedReview[i]['totalPoint'])
        this.rejectedStarArr.push(this.rejectedReview[i]['totalPoint'])
        this.rejectedReview[i]['name'] = this.rejectedReview[i]?.patientName?.split(' ');
      }


    })
  }
  datas:any=2
  viewDeatil(value:any,id:any) {
    const dialogRef = this.dialog.open(ViewReviewsComponent, {
      maxHeight: '100vh',
      width: '720px',
      panelClass: 'view-popup',
      data: {
        value:value,
        id:id
      }
    })
    
    dialogRef.afterClosed().subscribe((res:any)=>{
      let param={
        feedbackId:res?.id
      }
      let body={
        isDeleted:true
      }
      if(res?.id!=undefined || res?.id!=null){
      this.apiservice.PutData(URLConstant.deleteApprovedReview,body,param).subscribe((res:any)=>{
        if(res.success==true){
       this.toastr.success('Review has been deleted.')
       this.reviewList()
        }
      })
    }
  
    })
  }
  updatePageForHospital(event: any) {
    this.page = event;
    this.reviewList();
  }
  updatePgeRequested(event: any) {
    this.pageRequested = event;
    this.reviewList();
  }
  updatePgeRejected(event: any) {
    this.pageRejected = event;
    this.reviewList();
  }

  approvedFilter: any = []
  requestedFiler: any = []
  data1:any;
  data2:any;
  starFilter(event: any, value: any, index: any, id: any) {
    this.Stars[index].selected = event.checked;
    if (this.doctorsList == true) {
      if(event.checked==true)this.data1=value
      else this.data1=''
    }
    else if(this.hospitalsList == true){
      if(event.checked==true)this.data2=value
      else this.data2=''    }
   
  }
DeleteReview(value:any,id:any){
  const dialogRef = this.dialog.open(DeleteReviewComponent, {
    maxHeight: '100vh',
    width: '720px',
    panelClass: 'yespost',
    data: {
      value:value,
        id:id
    }
  });
  dialogRef.afterClosed().subscribe((res:any)=>{
    let param={
      feedbackId:res?.id
    }
    let body={
      isDeleted:true
    }
    if(res){
    this.apiservice.PutData(URLConstant.deleteApprovedReview,body,param).subscribe((res:any)=>{
      if(res.success==true){
     this.toastr.success('Review has been deleted.')
     this.reviewList()
      }
    })
  }

  })
  
}
rejectReview(type:any,value:any,id:any){
  const dialogRef = this.dialog.open(AcceptRejectComponent, {
    maxHeight: '100vh',
    width: '720px',
    panelClass: 'view-popup',
    data: {
      type:type,
      reject:value,
    }
  });
  dialogRef.afterClosed().subscribe((res:any)=>{
    let param={
      feedbackId:id
    }
    let body={
      status:3,
      reason:res?.rejectReason
    }
    this.apiservice.PutData(URLConstant.deleteApprovedReview,body,param).subscribe((res:any)=>{
      if(res.success==true){
     this.toastr.success('Review has been rejected.')
     this.reviewList()
      }
    })

  })
}
viewRejectedReason(id:any){
  const dialogRef = this.dialog.open(RejectedReviewReasonComponent,{
    maxHeight: '100vh',
    width: '720px',
    panelClass: 'view-popup',
    data: {
      id:id
    }
  });
}
acceptRequestedReview(id:any){
  console.log('helo')
  let param={
    feedbackId:id,
  }
  let body={
    status:2
  }
  this.apiservice.PutData(URLConstant.deleteApprovedReview,body,param).subscribe((res:any)=>{
    if(res.success==true){
   this.toastr.success('Review has been acceptd.')
   this.reviewList()
    }
  })
}
}

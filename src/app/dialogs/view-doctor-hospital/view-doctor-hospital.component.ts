import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { URLConstant } from 'src/app/apisURL/url';
import { ApiService } from 'src/app/shared/api.service';
import { ShowFullViewComponent } from '../show-full-view/show-full-view.component';

@Component({
  selector: 'app-view-doctor-hospital',
  templateUrl: './view-doctor-hospital.component.html',
  styleUrls: ['./view-doctor-hospital.component.scss']
})
export class ViewDoctorHospitalComponent implements OnInit {
  viewDetail:any;
  getVIewId:any;
  viewUser:any;
  hospitalDetail:any;
  identityProof:any=[]
medicalProof:any=[]
medicalProof1:any=[]
medicalProof2:any=[]
medicalProof3:any=[]
medicalProof4:any=[]
rejectedDoctorDetail:any
identityProofRejected:any=[]
medicalProofRejected:any=[];
idOfHospital:any=[];
medicalOfHospital:any=[];
  constructor(
    public dialogRef: MatDialogRef<ViewDoctorHospitalComponent>,
    public apiService:ApiService,
    public dialog:MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    ) { }

  ngOnInit(): void {
    this.getVIewId=this.data?.viewId
    this.viewUser=this.data?.value;
    this.viewDoctor();

  }
closeModal(){
  this.dialogRef.close();
}

establishment:any
establishmentrejected:any
viewDoctor(){
  // console.log("data ViewDoctorHospitalComponent",this.data)
  if(this.viewUser=='doctorpopup'){
    let param={
      userId:this.getVIewId
    }
  this.apiService.GetData(URLConstant.viewDoctorApproval,param).subscribe((res:any)=>{
    this.viewDetail=res?.result[0]
    console.log("my",this.viewDetail)
    this.establishment=this.viewDetail?.establishmentProof[0]
     this.identityProof=this.viewDetail?.identityProof;
     this.medicalProof1=this.viewDetail?.medicalProof;
     this.medicalProof2=this.viewDetail?.medicalProof2;
     this.medicalProof3=this.viewDetail?.medicalProof3;
     this.medicalProof4=this.viewDetail?.medicalProof4;

     for(let i=0;i<this.identityProof?.length;i++){
     let obj = this.identityProof[i];
  obj['name'] = 'Identity Proof';
  console.log('helo',this.identityProof)
    }
    for(let i=0;i<this.establishment?.length;i++){
      let obj = this.establishment[i];
   obj['name'] = 'Establishment Proof';
     }
     for(let i=0;i<this.medicalProof?.length;i++){
      let obj = this.medicalProof[i];
   obj['name'] = 'Medical Proof';
     }
     Array.prototype.push.apply(this.identityProof,this.establishment); 
    Array.prototype.push.apply(this.identityProof,this.medicalProof); 
    this.viewDetail['name']=this.viewDetail?.doctorDetails?.fullName?.split(' ');
  })
}
else if(this.viewUser=='hospitalpopup'){
  
  let param={
    hospitalId:this.getVIewId
  }
  this.apiService.GetData(URLConstant.viewHospitalDetail,param).subscribe((res:any)=>{
    this.hospitalDetail=res?.result[0]
    console.log("my",this.hospitalDetail)

    this.identityProofRejected=this.hospitalDetail?.identityProof;
    this.medicalProofRejected=this.hospitalDetail?.medicalProof;
    this.establishmentrejected=this.hospitalDetail?.establishmentProof
    for(let i=0;i<this.identityProofRejected?.length;i++){
      let obj = this.identityProofRejected[i];
   obj['name'] = 'Identity Proof';
     }
   
      for(let i=0;i<this.medicalProofRejected?.length;i++){
       let obj = this.medicalProofRejected[i];
    obj['name'] = 'Medical Proof';

      }
      for(let i=0;i<this.establishmentrejected?.length;i++){
        let obj = this.establishmentrejected[i];
     obj['name'] = 'Establishment Proof';
 
       }
       console.log(this.establishmentrejected)
       console.log(this.identityProofRejected)
       console.log(this.medicalProofRejected)
       Array.prototype.push.apply(this.identityProofRejected,this.establishmentrejected); 
       Array.prototype.push.apply(this.identityProofRejected,this.medicalProofRejected); 
   console.log('goa',this.identityProofRejected)
 

    this.hospitalDetail['name']=this.hospitalDetail?.hospitalName?.split(' ');
  })

}
else if(this.viewUser=='rejectDoctor'){
  console.log('hello')

  let param={
    id:this.getVIewId
  }
  this.apiService.GetData(URLConstant.viewRejectedDoctor,param).subscribe((res:any)=>{
    this.rejectedDoctorDetail=res?.result?.doctorDetails
    console.log('go',this.identityProofRejected)

    this.rejectedDoctorDetail['name']=this.rejectedDoctorDetail?.doctorName?.split(' ');
  })
}
else if(this.viewUser=='rejectHospital'){
  let param={
    id:this.getVIewId
  }
  this.apiService.GetData(URLConstant.viewRejectedDoctor,param).subscribe((res:any)=>{
    this.rejectedHospitalDetail=res?.result?.hospitalDetails
    console.log(this.rejectedHospitalDetail)
    this.rejectedHospitalDetail['name']=this.rejectedHospitalDetail?.establishmentName?.split(' ');
  })
}
}
rejectedHospitalDetail:any
identityProofRejectedHospital:any=[]
medicalProofRejectedHospital:any=[]
fullViewProof(img:any){
  console.log(img)
  if(img){
  const dialogRef=this.dialog.open(ShowFullViewComponent,{
    maxHeight: '600px',
    height:'600px',
    width: '730px',
    panelClass: 'view-popup',
    data:{
      image:img
    }
  })
  // this.dialogRef.close()
}

}
}

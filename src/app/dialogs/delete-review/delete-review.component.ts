import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-review',
  templateUrl: './delete-review.component.html',
  styleUrls: ['./delete-review.component.scss']
})
export class DeleteReviewComponent implements OnInit {

  constructor(
    public dialog:MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<DeleteReviewComponent>,

    ) { }
viewValue:any;
viewId:any;
  ngOnInit(): void {
    this.viewValue=this.data.value;
  this.viewId=this.data.id;
  }
  closeModal(){
    this.dialog.closeAll()
  }
  DeleteReviewComponent(){
    this.dialogRef.close({id:this.viewId})
  }

}

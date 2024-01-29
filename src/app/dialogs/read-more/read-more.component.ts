import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-read-more',
  templateUrl: './read-more.component.html',
  styleUrls: ['./read-more.component.scss']
})
export class ReadMoreComponent implements OnInit {

  constructor(@Inject (MAT_DIALOG_DATA) public data:any,public dialogRef:MatDialogRef<ReadMoreComponent>) { }
comments:any
  ngOnInit(): void {
this.comments=this.data.data
  }
  closeModal(){
    this.dialogRef.close();
  }
}

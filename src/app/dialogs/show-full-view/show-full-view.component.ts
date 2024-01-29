import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-show-full-view',
  templateUrl: './show-full-view.component.html',
  styleUrls: ['./show-full-view.component.scss']
})
export class ShowFullViewComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data:any,
    public dialogRef: MatDialogRef<ShowFullViewComponent>,

  ) { }
holdImage:any;
title:any
  ngOnInit(): void {
    console.log('helo',this.data)
    this.title=this.data?.image?.name
    this.holdImage=this.data?.image?.url
    console.log(this.data?.image)
  }
closeModal(){
  this.dialogRef.close()
}
}

import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AddFaqComponent } from '../add-faq/add-faq.component';

@Component({
  selector: 'app-delete-faq',
  templateUrl: './delete-faq.component.html',
  styleUrls: ['./delete-faq.component.scss']
})
export class DeleteFaqComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data:any,private dialogRef:MatDialogRef<DeleteFaqComponent>,private dialogs:MatDialogRef<DeleteFaqComponent>) { }

  ngOnInit(): void {
    
  }
  deleteFaq():void{

    this.dialogRef.close({id:this.data?.id,data:'present'})
  }
cancelFaq(){
  this.dialogRef.close()
}
}

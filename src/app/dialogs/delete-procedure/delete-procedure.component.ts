import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-procedure',
  templateUrl: './delete-procedure.component.html',
  styleUrls: ['./delete-procedure.component.scss']
})
export class DeleteProcedureComponent implements OnInit {

  constructor(@Inject (MAT_DIALOG_DATA) public data:any,private dialogRef:MatDialogRef<DeleteProcedureComponent>) { }
deleteType:any
  ngOnInit(): void {
    this.deleteType=this.data?.type
  }
  closeModal(){
    this.dialogRef.close({type:this.data?.type})
  }
  cancelmodal(){
    this.dialogRef.close()
  }

}

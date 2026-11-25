import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface RecycleBinConfirmData {
  title: string;
  message: string;
  confirmLabel: string;
  confirmClass?: 'danger' | 'primary';
}

@Component({
  selector: 'app-recycle-bin-confirm',
  templateUrl: './recycle-bin-confirm.component.html',
  styleUrls: ['./recycle-bin-confirm.component.scss'],
  })
export class RecycleBinConfirmComponent {
  isBusy = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: RecycleBinConfirmData,
    public dialogRef: MatDialogRef<RecycleBinConfirmComponent>
  ) {}

  cancel() {
    this.dialogRef.close(false);
  }

  confirm() {
    this.isBusy = true;
    this.dialogRef.close(true);
  }
}

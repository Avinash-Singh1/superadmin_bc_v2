import { Component, Inject } from "@angular/core";
import { UntypedFormBuilder, UntypedFormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: "app-faqs-modal",
  templateUrl: "./faqs-modal.component.html",
  styleUrls: ["./faqs-modal.component.scss"],
})
export class FaqsModalComponent {
  faqForm!: UntypedFormGroup;
  constructor(
    private fb: UntypedFormBuilder,
    public matdialogRef: MatDialogRef<FaqsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.createForm();
    if (this.data.edit) {
      this.faqForm.patchValue(this.data.patchValue);
    }
  }
  createForm() {
    this.faqForm = this.fb.group({
      question: [
        "",
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(200),
        ],
      ],
      answer: [
        "",
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(500),
        ],
      ],
    });
  }
  get control() {
    return this.faqForm.controls;
  }
  onDelete() {
    this.matdialogRef.close({ delete: true });
  }
  onSubmit() {
    this.faqForm.markAllAsTouched();
    console.log(this.faqForm);
    if (this.faqForm.valid) {
      this.matdialogRef.close(this.faqForm.value);
    }
  }
}

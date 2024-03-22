import { Component, Inject, OnInit } from "@angular/core";
import { UntypedFormBuilder, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Editor, Toolbar } from "ngx-editor";
import { URLConstant } from "src/app/apisURL/url";
import { ApiService } from "src/app/shared/api.service";

@Component({
  selector: "app-addedit-speciality",
  templateUrl: "./addedit-speciality.component.html",
  styleUrls: ["./addedit-speciality.component.scss"],
})
export class AddeditSpecialityComponent implements OnInit {
  addFaqForm: any;
  header: any;
  faq: any;
  submitted: boolean = false;
  editor: Editor = new Editor({ history: true, keyboardShortcuts: true });
  editor1: Editor = new Editor({ history: true, keyboardShortcuts: true });
  toolbar: Toolbar = [
    ["bold", "underline", "italic"],
    ["blockquote"],
    ["ordered_list", "bullet_list"],
    [{ heading: ["h1", "h2", "h3", "h4", "h5", "h6"] }],
    ["link", "image"],
    ["text_color", "background_color"],
    ["align_left", "align_center", "align_right", "align_justify"],
    ["horizontal_rule"],
    [],
  ];
  constructor(
    public fb: UntypedFormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<AddeditSpecialityComponent>,
    public apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.faqForm();
    this.header = this.data?.creation;
    this.faq = this.data?.type;
    console.log(this.data);

    this.addFaqForm.patchValue({
      question: this.data?.content,
      profilePic: this.data?.image,
      description: this.data?.description,
      links: this.data?.links,
    });
  }
  faqForm() {
    this.addFaqForm = this.fb.group({
      profilePic: ["", [Validators.required]],
      question: ["", [Validators.required]],
      description: ["", [Validators.required]],
      links: ["", [Validators.required]],
    });
  }
  get f() {
    return this.addFaqForm.controls;
  }
  addEditdata() {
    this.submitted = true;
    console.log(this.addFaqForm.valid);
    console.log("lll", this.addFaqForm?.value?.question);
    if (this.addFaqForm?.value?.question) {
      this.dialogRef.close({
        type: this.data?.type,
        creation: this.data?.creation,
        name: this.addFaqForm?.value?.question,
        id: this.data?.id,
        imageURL: this.profileImage,
        description: this.addFaqForm?.value?.description,
        links: this.addFaqForm?.value?.links,
      });
    }
  }
  closeModal() {
    this.dialogRef.close();
  }
  file: any;
  profileImage: any;

  onChange(event: any) {
    this.file = event.target.files[0];
    const formData = new FormData();
    formData.append("file", this.file, this.file.name);
    console.log(formData);

    this.apiService.Postdata(URLConstant.fileupload, formData, {}).subscribe(
      (res) => {
        this.profileImage = res.result?.uri?.uri;
        this.f["profilePic"].setValue(res.result?.uri?.uri);

        console.log(res);
      },
      (error) => {}
    );
  }
}

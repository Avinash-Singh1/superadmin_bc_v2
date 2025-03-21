import { Component, Inject, OnInit, OnDestroy } from "@angular/core";
import { UntypedFormBuilder, Validators, FormGroup } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Editor, Toolbar, toHTML } from "ngx-editor";
import { URLConstant } from "src/app/apisURL/url";
import { ApiService } from "src/app/shared/api.service";

@Component({
  selector: "app-addedit-speciality",
  templateUrl: "./addedit-speciality.component.html",
  styleUrls: ["./addedit-speciality.component.scss"],
})
export class AddeditSpecialityComponent implements OnInit, OnDestroy {
  addFaqForm!: FormGroup;
  header: string = "";
  faq: string = "";
  submitted: boolean = false;
  editor: Editor = new Editor();
  editor1: Editor = new Editor();
  toolbar: Toolbar = [
    ["bold", "underline", "italic"],
    ["blockquote"],
    ["ordered_list", "bullet_list"],
    [{ heading: ["h1", "h2", "h3", "h4", "h5", "h6"] }],
    ["link", "image"],
    ["text_color", "background_color"],
    ["align_left", "align_center", "align_right", "align_justify"],
    ["horizontal_rule"],
  ];
  additionalSections: { title: string; editor: Editor; content: string }[] = [];
  profileImage: string = "";

  constructor(
    private fb: UntypedFormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<AddeditSpecialityComponent>,
    private apiService: ApiService
  ) {}

ngOnInit(): void {
  this.initFaqForm();
  this.header = this.data?.creation || "";
  this.faq = this.data?.type || "";

  // Populate main form fields
  this.addFaqForm.patchValue({
    question: this.data?.content || "",
    profilePic: this.data?.image || "",
    description: this.data?.description || "",
    links: this.data?.links || "",
  });

  // Initialize additional sections with existing data
  if (this.data?.sections) {
    this.additionalSections = this.data.sections.map((section: any) => {
      const editorInstance = new Editor();
      editorInstance.setContent(section.content || ""); // Set pre-existing content

      return {
        title: section.title || "",
        editor: editorInstance,
        content: section.content || "",
      };
    });
  }
}


  initFaqForm() {
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
    if (this.addFaqForm.valid) {
      const sectionsData = this.additionalSections.map((section) => ({
        title: section.title.trim(),
        content: section.content, 
      })); 
      this.dialogRef.close({
        type: this.data?.type,
        creation: this.data?.creation,
        name: this.addFaqForm.value.question,
        id: this.data?.id,
        imageURL: this.profileImage,
        description: this.addFaqForm.value.description,
        links: this.addFaqForm.value.links,
        sections: sectionsData,
      });
    }
  }

  closeModal() {
    this.dialogRef.close();
  }

  onChange(event: any) {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append("file", file, file.name);

    this.apiService.Postdata(URLConstant.fileupload, formData, {}).subscribe(
      (res) => {
        this.profileImage = res.result?.uri?.uri;
        this.addFaqForm.get("profilePic")?.setValue(res.result?.uri?.uri);
      },
      (error) => console.error(error)
    );
  }

  addSection() {
    const newEditor = new Editor();
    const newSection = {
      title: "",
      editor: newEditor,
      content: "",
    };

    // Listen for changes and store HTML content correctly
    newEditor.valueChanges.subscribe((content) => {
      newSection.content = toHTML(content);
    });

    this.additionalSections.push(newSection);
  }

  deleteSection(index: number) {
    this.additionalSections[index].editor.destroy();
    this.additionalSections.splice(index, 1);
  }

  updateTitle(event: any, index: number) {
    this.additionalSections[index].title = event.target.value;
  }

  updateContent(event: any, index: number) {
    this.additionalSections[index].content = toHTML(event);
  }

  ngOnDestroy(): void {
    this.editor.destroy();
    this.editor1.destroy();
    this.additionalSections.forEach((section) => section.editor.destroy());
  }
}

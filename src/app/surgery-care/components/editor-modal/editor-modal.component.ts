import { Component, Inject, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from "@angular/material/dialog";
import { Editor, Toolbar, Validators } from "ngx-editor";
import { ImageUploadModalComponent } from "../image-upload-modal/image-upload-modal.component";
@Component({
  selector: "app-editor-modal",
  templateUrl: "./editor-modal.component.html",
  styleUrls: ["./editor-modal.component.scss"],
})
export class EditorModalComponent implements OnInit, OnDestroy {
  constructor(
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public matdialogRef: MatDialogRef<EditorModalComponent>,
    private matdialog: MatDialog
  ) {}
  editorForm!: FormGroup;
  editor: Editor = new Editor({ history: true, keyboardShortcuts: true });
  html: string = "";
  htmlEditor: boolean = false;
  getdata: any;
  ngOnInit(): void {
    this.validateForm();
  }
  onInsertImage() {
    const imageModal = this.matdialog.open(ImageUploadModalComponent, {
      width: "360px",
    });
    imageModal.afterClosed().subscribe((res) => {
      if (res) {
        this.editor.commands.insertImage(res).scrollIntoView().exec();
      }
    });
  }
  toolbar: Toolbar = [
    ["bold", "underline", "italic"],
    ["strike"],
    ["code", "blockquote"],
    ["ordered_list", "bullet_list"],
    [{ heading: ["h1", "h2", "h3", "h4", "h5", "h6"] }],
    ["link", "image"],
    ["text_color", "background_color"],
    ["align_left", "align_center", "align_right", "align_justify"],
    ["horizontal_rule"],
    [],
  ];
  validateForm() {
    this.editorForm = this.fb.group({
      title: [
        this.data.title,
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
        ],
      ],
      description: [
        this.data.description,
        [Validators.required, Validators.minLength(10)],
      ],
    });
  }
  onSave() {
    console.log(this.editorForm);
    this.matdialogRef.close({
      edit: true,
      ...this.data,
      ...this.editorForm.value,
    });
  }
  ngOnDestroy(): void {
    this.editor.destroy();
  }
  editorContent: string = ""; // Initialize with some default content

  onEditorContentChange(content: any): void {
    console.log("Editor content changed:", content);
  }
}

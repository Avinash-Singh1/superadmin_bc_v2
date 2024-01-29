import { Component, Inject, OnInit } from "@angular/core";
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from "@angular/material/dialog";
import { ToastrService } from "ngx-toastr";
import { URLConstant } from "src/app/apisURL/url";
import { ApiService } from "src/app/shared/api.service";
import { EditorModalComponent } from "../editor-modal/editor-modal.component";
import { FaqsModalComponent } from "../faqs-modal/faqs-modal.component";

@Component({
  selector: "app-edit-surgery-modal",
  templateUrl: "./edit-surgery-modal.component.html",
  styleUrls: ["./edit-surgery-modal.component.scss"],
})
export class EditSurgeryModalComponent implements OnInit {
  constructor(
    private matdialog: MatDialog,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private apiService: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public matdialogRef: MatDialogRef<EditSurgeryModalComponent>
  ) {}
  surgeryForm!: FormGroup;
  acceptedFileType = ["image/jpeg", "image/jpg", "image/png"];
  departmentList: any = [];
  activeAccordion!: string;
  ngOnInit(): void {
    this.validateForm();
    this.getDepartmentList();
    this.getFaqsList();
  }
  getDepartmentList() {
    this.apiService.GetData(URLConstant.department, {}).subscribe({
      next: (res) => {
        this.departmentList = res.result;
      },
    });
  }
  onEdit(index: number) {
    const editorDialog = this.matdialog.open(EditorModalComponent, {
      width: "75vw",
      autoFocus: false,
      panelClass: "editor-modal-panelClass",
      data: {
        ...this.componentArray.get(String(index))?.value,
      },
    });
    editorDialog.afterClosed().subscribe(({ edit, sno, ...formvalue }) => {
      if (edit) {
        this.componentArray.get(String(index))?.patchValue({ ...formvalue });
        if (sno == 1) {
          this.surgeryForm.patchValue({
            name: formvalue.title,
            title: formvalue.title,
            seoTitle: formvalue.title,
          });
        }
      }
    });
  }
  validateForm() {
    this.surgeryForm = this.fb.group({
      seoTitle: [""],
      seoDescription: [],
      title: [""],
      name: [""],
      imageUrl: ["", [Validators.required]],
      description: [],
      components: this.createComponent(),
      faq: this.fb.array([]),
      departmentId: ["", Validators.required],
    });
    this.surgeryForm.patchValue({
      ...this.data.patchData,
      name: this.data.patchData.title,
    });
    const { image } = this.data.patchData.components[3];
    image?.forEach((item: any) => {
      this.imageArray(3).push(new FormControl(item));
    });
  }
  get control() {
    return this.surgeryForm.controls;
  }
  createComponent() {
    return this.fb.array([
      this.fb.group({
        sno: [1, [Validators.required]],
        title: ["", [Validators.required]],
        description: [``, [Validators.required]],
        image: this.fb.array([this.fb.control("")], this.validateImagesArray()),
      }),
      this.fb.group({
        sno: [2, [Validators.required]],
        title: ["", [Validators.required]],
        description: [``, [Validators.required]],
      }),
      this.fb.group({
        sno: [3, [Validators.required]],
        title: ["", [Validators.required]],
        description: [``, [Validators.required]],
      }),
      this.fb.group({
        sno: [4, [Validators.required]],
        title: [""],
        description: [``],
        image: this.fb.array([]),
      }),
      this.fb.group({
        sno: [5, [Validators.required]],
        title: ["", [Validators.required]],
        description: [``, [Validators.required]],
      }),
      this.fb.group({
        sno: [6, [Validators.required]],
        title: ["", [Validators.required]],
        description: [``, [Validators.required]],
      }),
    ]);
  }
  get componentArray() {
    return this.surgeryForm.get("components") as FormArray;
  }
  get faqArray() {
    return this.surgeryForm.get("faq") as FormArray;
  }
  imageArray(i: number) {
    return this.componentArray.get(String(i))?.get("image") as FormArray;
  }
  onUploadFile(
    event: any,
    controlName: any,
    array: boolean = true,
    previous: boolean = false
  ) {
    if (event.target.files?.length) {
      const file = event.target.files[0];
      if (!this.acceptedFileType.includes(file.type)) {
        this.toastr.error("Please upload file in pdf, jpeg, jpg or png format");
        return;
      }
      this.apiService.fileUpload(file).subscribe({
        next: (res: any) => {
          const { uri } = res.result.uri;
          if (uri) {
            if (array) {
              previous
                ? this.imageArray(controlName).push(new FormControl(uri))
                : this.componentArray
                    .get(controlName)
                    ?.patchValue({ image: [uri] });
              return;
            }
            this.surgeryForm.patchValue({ [controlName]: uri });
          }
        },
      });
    }
  }
  onDelete(i: number, j: number) {
    this.imageArray(i).removeAt(j);
  }
  onChangeImage(event: any, i: number, j: number) {
    if (event.target.files?.length) {
      const file = event.target.files[0];
      if (!this.acceptedFileType.includes(file.type)) {
        this.toastr.error("Please upload file in pdf, jpeg, jpg or png format");
        return;
      }
      this.apiService.fileUpload(file).subscribe({
        next: (res: any) => {
          const { uri } = res.result.uri;
          if (uri) {
            this.onDelete(i, j);
            this.imageArray(i).insert(j, new FormControl(uri));
          }
        },
      });
    }
  }
  onSubmit() {
    console.log(this.surgeryForm);
    this.surgeryForm.markAllAsTouched();
    if (this.surgeryForm.valid) {
      this.apiService
        .PutData(
          `${URLConstant.addSurgery}/${this.data.patchData._id}`,
          this.surgeryForm.value,
          {}
        )
        .subscribe({
          next: (res: any) => {
            console.log(res);
            this.toastr.success("Surgery updated successfully.");
            this.matdialogRef.close(true);
          },
          error: (error: any) => {
            console.log(error.message);

            this.toastr.error(error.message);
          },
        });
    }
  }
  getFaqsList() {
    const { _id } = this.data.patchData;
    this.apiService
      .GetData(URLConstant.surgeryFaq, { surgeryId: _id })
      .subscribe({
        next: (res: any) => {
          const { count, data } = res.result;
          if (count) {
            data.forEach((faq: any) => {
              this.faqArray.push(
                this.fb.group({
                  answer: [faq.answer],
                  question: [faq.question],
                  id: [faq._id],
                })
              );
            });
          }
          console.log(res);
        },
        error: (error: any) => {
          console.log(error);
        },
      });
  }
  onAddFaqs(edit: boolean = false, i?: number) {
    const faqDialog = this.matdialog.open(FaqsModalComponent, {
      width: "720px",
      data: {
        edit,
        patchValue: this.faqArray.get(String(i))?.value,
      },
    });
    faqDialog.afterClosed().subscribe((res: any) => {
      if (res) {
        if (res?.delete && (i == 0 || i)) {
          this.apiService
            .DeleteData(
              `${URLConstant.surgeryFaqAdd}/${
                this.faqArray.get(String(i))?.value.id
              }`,
              {}
            )
            .subscribe({
              next: (response: any) => {
                this.faqArray.removeAt(i);
              },
              error: (error: any) => {},
            });
          return;
        }
        if (edit) {
          this.apiService
            .PutData(
              `${URLConstant.surgeryFaqAdd}/${
                this.faqArray.get(String(i))?.value.id
              }`,
              res,
              {}
            )
            .subscribe({
              next: (response: any) => {
                this.faqArray.get(String(i))?.patchValue(res);
              },
              error: (error: any) => {},
            });
          return;
        }
        this.apiService
          .Postdata(
            URLConstant.surgeryFaqAdd,
            { ...res, surgeryId: this.data.patchData._id },
            {}
          )
          .subscribe({
            next: (response: any) => {
              this.faqArray.push(
                this.fb.group({
                  answer: [res.answer],
                  question: [res.question],
                  id: [response.result._id],
                })
              );
            },
          });
      }
    });
  }
  validateImagesArray(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const formArray = control as FormArray;
      const valid = formArray.controls.some(
        (control) => control.value.trim() !== ""
      );
      return valid ? null : { imagesRequired: true };
    };
  }
}

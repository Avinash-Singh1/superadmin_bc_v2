import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { EditorModalComponent } from "../editor-modal/editor-modal.component";
import {
  AbstractControl,
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { ApiService } from "src/app/shared/api.service";
import { URLConstant } from "src/app/apisURL/url";
import { ActivatedRoute, Router } from "@angular/router";
import { FaqsModalComponent } from "../faqs-modal/faqs-modal.component";

@Component({
  selector: "app-add-surgery",
  templateUrl: "./add-surgery.component.html",
  styleUrls: ["./add-surgery.component.scss"],
})
export class AddSurgeryComponent implements OnInit {
  constructor(
    private matdialog: MatDialog,
    private fb: UntypedFormBuilder,
    private toastr: ToastrService,
    private apiService: ApiService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}
  surgeryForm!: UntypedFormGroup;
  acceptedFileType = ["image/jpeg", "image/jpg", "image/png"];
  activeAccordion!: string;
  departmentList: any = [];
  surgeryList: any = [];
  specializationList: any = [];
  activeTab = "content"; // content | seo-eeat | city-targeting
  ngOnInit(): void {
    this.validateForm();
    this.getDepartmentList();
    this.getSpecializationList();
    this.getSurgeryList();
  }
  onEdit(index: number) {
    // Responsive modal sizing based on screen width
    const isMobile = window.innerWidth < 810; // $screen-md-min breakpoint
    const modalConfig = {
      width: isMobile ? "95vw" : "75vw",
      maxWidth: isMobile ? "95vw" : "1200px",
      height: isMobile ? "90vh" : "80vh",
      maxHeight: isMobile ? "90vh" : "80vh",
      autoFocus: false,
      panelClass: "editor-modal-panelClass",
      data: {
        ...this.componentArray.get(String(index))?.value,
      },
    };

    const editorDialog = this.matdialog.open(EditorModalComponent, modalConfig);
    editorDialog.afterClosed().subscribe((result) => {
      if (result?.edit) {
        const { edit, sno, ...formvalue } = result;
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
      seoTitle: [null, [Validators.required]],
      seoDescription: [null],
      title: [null, [Validators.required]],
      name: [null],
      departmentId: [null, [Validators.required]],
      imageUrl: [null],
      description: [],
      components: this.createComponent(),
      faq: this.fb.array([]),
      // Treatment SEO Engine fields
      symptoms: [null],
      causes: [null],
      diagnosis: [null],
      procedureSteps: [null],
      benefits: [null],
      risks: [null],
      recoveryTimeline: [null],
      whenNeeded: [null],
      typesOfSurgery: [null],
      successRate: [null],
      costRange: this.fb.group({
        min: [null],
        max: [null],
        currency: ["INR"],
      }),
      medicalReviewer: this.fb.group({
        doctorId: [null],
        name: [null],
        qualification: [null],
        experience: [null],
        specialization: [null],
      }),
      author: this.fb.group({
        name: [null],
        role: [null],
      }),
      references: this.fb.array([]),
      medicalDisclaimer: [null],
      relatedTreatments: [[]],
      specializationIds: [[]],
      subtopics: this.fb.group({
        cost: [null],
        recovery: [null],
        procedure: [null],
        risks: [null],
        successRate: [null],
      }),
      isPublished: [false],
    });
  }
  get control() {
    return this.surgeryForm.controls;
  }
  createComponent() {
    return this.fb.array([
      this.fb.group({
        sno: [1, [Validators.required]],
        title: [null, [Validators.required]],
        description: [null, [Validators.required]],
        image: this.fb.array([], this.validateImagesArray()),
      }),
      this.fb.group({
        sno: [2, [Validators.required]],
        title: [null, [Validators.required]],
        description: [null, [Validators.required]],
      }),
      this.fb.group({
        sno: [3, [Validators.required]],
        title: [null, [Validators.required]],
        description: [null, [Validators.required]],
      }),
      this.fb.group({
        sno: [4, [Validators.required]],
        title: [null],
        description: [null],
        image: this.fb.array([]),
      }),
      this.fb.group({
        sno: [5, [Validators.required]],
        title: [null, [Validators.required]],
        description: [null, [Validators.required]],
      }),
      this.fb.group({
        sno: [6, [Validators.required]],
        title: [null, [Validators.required]],
        description: [null, [Validators.required]],
      }),
    ]);
  }
  get componentArray() {
    return this.surgeryForm.get("components") as UntypedFormArray;
  }
  get faqArray() {
    return this.surgeryForm.get("faq") as UntypedFormArray;
  }
  imageArray(i: number) {
    return this.componentArray.get(String(i))?.get("image") as UntypedFormArray;
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
        event.target.value = '';
        return;
      }
      this.apiService.fileUpload(file).subscribe({
        next: (res: any) => {
          const { uri } = res.result.uri;
          if (uri) {
            if (array) {
              if (previous) {
                this.imageArray(controlName).push(new UntypedFormControl(uri));
              } else {
                const imgArr = this.componentArray.get(String(controlName))?.get('image') as UntypedFormArray;
                if (imgArr) {
                  imgArr.clear();
                  imgArr.push(new UntypedFormControl(uri));
                }
              }
              event.target.value = '';
              return;
            }
            this.surgeryForm.patchValue({ [controlName]: uri });
          }
          event.target.value = '';
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
        event.target.value = '';
        return;
      }
      this.apiService.fileUpload(file).subscribe({
        next: (res: any) => {
          const { uri } = res.result.uri;
          if (uri) {
            this.onDelete(i, j);
            this.imageArray(i).insert(j, new UntypedFormControl(uri));
          }
          event.target.value = '';
        },
      });
    }
  }
  onSubmit() {
    this.surgeryForm.markAllAsTouched();
    if (this.surgeryForm.valid) {
      this.apiService
        .Postdata(URLConstant.addSurgery, this.surgeryForm.value, {})
        .subscribe({
          next: (res: any) => {
            this.toastr.success("Surgery added successfully.");
            this.onRoute();
          },
          error: (error: any) => {
            console.log(error.message);

            this.toastr.error(error.message);
          },
        });
    }
  }
  validateImagesArray(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const formArray = control as UntypedFormArray;
      const valid = formArray.controls.some(
        (control) => control.value.trim() !== ""
      );
      return valid ? null : { imagesRequired: true };
    };
  }
  onRoute() {
    this.router.navigate(["../list"], {
      relativeTo: this.activatedRoute,
    });
  }
  getDepartmentList() {
    this.apiService.GetData(URLConstant.department, {}).subscribe({
      next: (res) => {
        this.departmentList = res.result;
      },
    });
  }
  getSpecializationList() {
    this.apiService.GetData(URLConstant.specialization, {}).subscribe({
      next: (res: any) => {
        this.specializationList = res.result?.data || [];
      },
    });
  }
  getSurgeryList() {
    this.apiService.GetData(URLConstant.masterSurgerylist, {}).subscribe({
      next: (res: any) => {
        this.surgeryList = res.result?.data || [];
      },
    });
  }
  get referencesArray() {
    return this.surgeryForm.get("references") as UntypedFormArray;
  }
  onAddReference() {
    this.referencesArray.push(
      this.fb.group({
        title: [""],
        url: [""],
        source: [""],
      })
    );
  }
  onRemoveReference(i: number) {
    this.referencesArray.removeAt(i);
  }

  refUrlControl = new UntypedFormControl('');
  fetchingRef = false;

  onFetchReference() {
    const url = (this.refUrlControl.value || '').trim();
    if (!url) return;
    this.fetchingRef = true;
    this.apiService
      .Postdata(URLConstant.fetchUrlMeta, { url }, {})
      .subscribe({
        next: (res: any) => {
          const data = res?.result || {};
          this.referencesArray.push(
            this.fb.group({
              title: [data.title || ''],
              url: [data.url || url],
              source: [data.source || ''],
            })
          );
          this.refUrlControl.setValue('');
          this.fetchingRef = false;
          this.toastr.success('Reference fetched successfully');
        },
        error: (err: any) => {
          console.error('Fetch reference error:', err);
          this.fetchingRef = false;
          this.toastr.error('Could not fetch URL metadata. Adding manually.');
          this.referencesArray.push(
            this.fb.group({ title: [''], url: [url], source: [''] })
          );
          this.refUrlControl.setValue('');
        },
      });
  }
  onEditContentBlock(field: string) {
    // Responsive modal sizing based on screen width
    const isMobile = window.innerWidth < 810; // $screen-md-min breakpoint
    const modalConfig = {
      width: isMobile ? "95vw" : "75vw",
      maxWidth: isMobile ? "95vw" : "1200px",
      height: isMobile ? "90vh" : "80vh",
      maxHeight: isMobile ? "90vh" : "80vh",
      autoFocus: false,
      panelClass: "editor-modal-panelClass",
      data: {
        sno: 0,
        title: field
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (s: string) => s.toUpperCase()),
        description: this.surgeryForm.get(field)?.value || "",
      },
    };

    const editorDialog = this.matdialog.open(EditorModalComponent, modalConfig);
    editorDialog.afterClosed().subscribe((result: any) => {
      if (result?.edit) {
        this.surgeryForm.patchValue({ [field]: result.description });
      }
    });
  }
  onEditSubtopic(key: string) {
    const subtopics = this.surgeryForm.get("subtopics") as UntypedFormGroup;
    // Responsive modal sizing based on screen width
    const isMobile = window.innerWidth < 810; // $screen-md-min breakpoint
    const modalConfig = {
      width: isMobile ? "95vw" : "75vw",
      maxWidth: isMobile ? "95vw" : "1200px",
      height: isMobile ? "90vh" : "80vh",
      maxHeight: isMobile ? "90vh" : "80vh",
      autoFocus: false,
      panelClass: "editor-modal-panelClass",
      data: {
        sno: 0,
        title: key.charAt(0).toUpperCase() + key.slice(1) + " Page Content",
        description: subtopics.get(key)?.value || "",
      },
    };

    const editorDialog = this.matdialog.open(EditorModalComponent, modalConfig);
    editorDialog.afterClosed().subscribe((result: any) => {
      if (result?.edit) {
        subtopics.patchValue({ [key]: result.description });
      }
    });
  }
  onToggleRelatedTreatment(surgeryId: string) {
    const current: string[] = this.surgeryForm.get("relatedTreatments")?.value || [];
    const idx = current.indexOf(surgeryId);
    if (idx > -1) {
      current.splice(idx, 1);
    } else {
      current.push(surgeryId);
    }
    this.surgeryForm.patchValue({ relatedTreatments: [...current] });
  }
  isRelatedSelected(surgeryId: string): boolean {
    return (this.surgeryForm.get("relatedTreatments")?.value || []).includes(surgeryId);
  }
  onAddFaqs(edit: boolean = false, i?: number) {
    const faqDialog = this.matdialog.open(FaqsModalComponent, {
      width: "720px",
      panelClass: "faq-modal-panelClass",
      data: {
        edit,
        patchValue: this.faqArray.get(String(i))?.value,
      },
    });
    faqDialog.afterClosed().subscribe((res: any) => {

      if (res) {
        if ((res?.delete && i == 0) || i) {
          this.faqArray.removeAt(i);
          return;
        }
        if (edit) {
          this.faqArray.get(String(i))?.patchValue(res);
          return;
        }
        this.faqArray.push(
          this.fb.group({
            answer: [res.answer],
            question: [res.question],
          })
        );
      }
    });
  }
}

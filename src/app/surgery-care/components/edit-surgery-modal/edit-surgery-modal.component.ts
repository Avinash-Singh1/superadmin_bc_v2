import { Component, Inject, OnInit } from "@angular/core";
import {
  AbstractControl,
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
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
    private fb: UntypedFormBuilder,
    private toastr: ToastrService,
    private apiService: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public matdialogRef: MatDialogRef<EditSurgeryModalComponent>
  ) {}
  surgeryForm!: UntypedFormGroup;
  acceptedFileType = ["image/jpeg", "image/jpg", "image/png", "image/svg+xml"];
  departmentList: any = [];
  specializationList: any = [];
  activeAccordion!: string;
  surgeryList: any[] = [];
  activeTab: string = "content";

  contentBlocks = [
    { field: "symptoms", label: "Symptoms" },
    { field: "causes", label: "Causes" },
    { field: "whenNeeded", label: "When Needed" },
    { field: "diagnosis", label: "Diagnosis" },
    { field: "typesOfSurgery", label: "Types of Surgery" },
    { field: "procedureSteps", label: "Procedure Steps" },
    { field: "benefits", label: "Benefits" },
    { field: "risks", label: "Risks" },
    { field: "recoveryTimeline", label: "Recovery Timeline" },
    { field: "successRate", label: "Success Rate" },
  ];

  subtopicList = [
    { key: "cost", label: "Cost Page" },
    { key: "recovery", label: "Recovery Page" },
    { key: "procedure", label: "Procedure Page" },
    { key: "risks", label: "Risks Page" },
    { key: "successRate", label: "Success Rate Page" },
  ];

  ngOnInit(): void {
    this.validateForm();
    this.getDepartmentList();
    this.getSpecializationList();
    this.getFaqsList();
    this.getSurgeryList();
    this.getSurgeryDetails();
  }

  getSurgeryDetails() {
    const surgeryId = this.data?.patchData?._id;
    if (!surgeryId) {
      this.toastr.error("Unable to load surgery details.");
      return;
    }

    this.apiService.GetData(`${URLConstant.addSurgery}/${surgeryId}`, {}).subscribe({
      next: (res: any) => {
        const surgery = res?.result;
        if (!surgery) {
          this.toastr.error("Unable to load surgery details.");
          return;
        }

        this.data.patchData = surgery;
        this.patchForm(surgery);
      },
      error: () => {
        this.toastr.error("Unable to load surgery details.");
      },
    });
  }

  getDepartmentList() {
    this.apiService.GetData(URLConstant.department, {}).subscribe({
      next: (res: any) => {
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
      seoTitle: ["", [Validators.required]],
      seoDescription: [],
      title: ["", [Validators.required]],
      name: [""],
      imageUrl: [""],
      description: [],
      components: this.createComponent(),
      faq: this.fb.array([]),
      departmentId: ["", Validators.required],
      // Treatment SEO fields
      symptoms: [""],
      causes: [""],
      diagnosis: [""],
      procedureSteps: [""],
      benefits: [""],
      risks: [""],
      recoveryTimeline: [""],
      whenNeeded: [""],
      typesOfSurgery: [""],
      successRate: [""],
      costRange: this.fb.group({
        min: [null],
        max: [null],
        currency: ["INR"],
      }),
      medicalReviewer: this.fb.group({
        doctorId: [null],
        name: [""],
        qualification: [""],
        experience: [""],
        specialization: [""],
      }),
      author: this.fb.group({
        name: [""],
        role: [""],
      }),
      references: this.fb.array([]),
      medicalDisclaimer: [""],
      relatedTreatments: [[]],
      specializationIds: [[]],
      subtopics: this.fb.group({
        cost: [""],
        recovery: [""],
        procedure: [""],
        risks: [""],
        successRate: [""],
      }),
      // ── Rich Schema / Clinical fields ──
      videoUrl: [""],
      preparationSteps: [""],
      alternativeNames: [""], // stored as comma-separated string in form, converted on submit
      bodyLocation: [""],
      procedureType: ["SurgicalProcedure"],
      avgHospitalizationDays: [null],
      insuranceCovered: [true],
      tags: [""], // stored as comma-separated string in form, converted on submit
      isPublished: [false],
    });
  }

  patchForm(patch: any) {
    // Extract plain IDs — the list API populates departmentId as an object
    const deptId =
      typeof patch.departmentId === "object" && patch.departmentId
        ? patch.departmentId._id
        : patch.departmentId;

    // specializationIds and relatedTreatments may be ObjectId strings or populated objects
    const specIds = (patch.specializationIds || []).map((s: any) =>
      typeof s === "object" && s ? s._id : s
    );
    const relatedIds = (patch.relatedTreatments || []).map((r: any) =>
      typeof r === "object" && r ? r._id : r
    );

    // Extract plain doctorId if populated as object
    const reviewerDoctorId =
      typeof patch.medicalReviewer?.doctorId === "object" && patch.medicalReviewer.doctorId
        ? patch.medicalReviewer.doctorId._id
        : patch.medicalReviewer?.doctorId;

    this.surgeryForm.patchValue({
      ...patch,
      name: patch.title,
      departmentId: deptId,
      specializationIds: specIds,
      relatedTreatments: relatedIds,
      medicalReviewer: {
        ...(patch.medicalReviewer || {}),
        doctorId: reviewerDoctorId || null,
      },
      // Convert arrays to comma-separated strings for the text inputs
      alternativeNames: Array.isArray(patch.alternativeNames)
        ? patch.alternativeNames.join(', ')
        : (patch.alternativeNames || ''),
      tags: Array.isArray(patch.tags)
        ? patch.tags.join(', ')
        : (patch.tags || ''),
    });

    const image0 = patch.components?.[0]?.image || [];
    const imgArr0 = this.imageArray(0);
    imgArr0.clear();
    image0.forEach((item: any) => {
      imgArr0.push(new UntypedFormControl(item));
    });

    const { image } = patch.components?.[3] || {};
    image?.forEach((item: any) => {
      this.imageArray(3).push(new UntypedFormControl(item));
    });
    // Patch references array
    if (patch.references?.length) {
      this.referencesArray.clear();
      patch.references.forEach((ref: any) => {
        this.referencesArray.push(
          this.fb.group({
            title: [ref.title || ""],
            url: [ref.url || ""],
            source: [ref.source || ""],
          })
        );
      });
    }
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
        image: this.fb.array([], this.validateImagesArray()),
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
        this.toastr.error("Please upload file in pdf, jpeg, jpg, png or svg format");
        event.target.value = '';
        return;
      }
      this.apiService.fileUpload(file).subscribe({
        next: (res: any) => {
          const uri = res?.data?.url || res?.result?.uri?.uri || res?.result?.uri || res?.result?.url;
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
        this.toastr.error("Please upload file in pdf, jpeg, jpg, png or svg format");
        event.target.value = '';
        return;
      }
      this.apiService.fileUpload(file).subscribe({
        next: (res: any) => {
          const uri = res?.data?.url || res?.result?.uri?.uri || res?.result?.uri || res?.result?.url;
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
      const payload = { ...this.surgeryForm.value };
      // Convert comma-separated strings to arrays
      payload.alternativeNames = payload.alternativeNames
        ? String(payload.alternativeNames).split(',').map((s: string) => s.trim()).filter(Boolean)
        : [];
      payload.tags = payload.tags
        ? String(payload.tags).split(',').map((s: string) => s.trim()).filter(Boolean)
        : [];
      if (payload.medicalReviewer && typeof payload.medicalReviewer.doctorId === 'object' && payload.medicalReviewer.doctorId) {
        payload.medicalReviewer.doctorId = payload.medicalReviewer.doctorId._id;
      }
      this.apiService
        .PutData(
          `${URLConstant.addSurgery}/${this.data.patchData._id}`,
          payload,
          {}
        )
        .subscribe({
          next: (res: any) => {
            this.toastr.success("Surgery updated successfully.");
            this.matdialogRef.close(true);
          },
          error: (error: any) => {
            console.log(error.message);
            this.toastr.error(error.message);
          },
        });
    } else {
      const invalidFields: string[] = [];
      const controls = this.surgeryForm.controls;
      for (const name in controls) {
        if (controls[name].invalid) {
          if (name === 'components') {
            const comps = this.componentArray;
            comps.controls.forEach((group: any, idx: number) => {
              if (group.invalid) {
                const subfields: string[] = [];
                for (const subname in group.controls) {
                  if (group.controls[subname].invalid) {
                    subfields.push(subname);
                  }
                }
                invalidFields.push(`Component ${idx + 1} (${subfields.join(', ')})`);
              }
            });
          } else {
            invalidFields.push(name);
          }
        }
      }
      this.toastr.error("Please fill in all required fields: " + invalidFields.join(', '));
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
            this.faqArray.clear();
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
        },
        error: (error: any) => {
          console.log(error);
        },
      });
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
      const formArray = control as UntypedFormArray;
      const valid = formArray.controls.some(
        (ctrl) => typeof ctrl.value === 'string' && ctrl.value.trim() !== ""
      );
      return valid ? null : { imagesRequired: true };
    };
  }

  // Treatment SEO helpers
  getSurgeryList() {
    this.apiService
      .GetData(URLConstant.masterSurgerylist, {})
      .subscribe({
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
      this.fb.group({ title: [""], url: [""], source: [""] })
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
    const currentValue = this.surgeryForm.get(field)?.value || "";
    // Responsive modal sizing based on screen width
    const isMobile = window.innerWidth < 810; // $screen-md-min breakpoint
    const modalConfig = {
      width: isMobile ? "95vw" : "75vw",
      maxWidth: isMobile ? "95vw" : "1200px",
      height: isMobile ? "90vh" : "80vh",
      maxHeight: isMobile ? "90vh" : "80vh",
      autoFocus: false,
      panelClass: "editor-modal-panelClass",
      data: { sno: 0, title: field, description: currentValue },
    };

    const editorDialog = this.matdialog.open(EditorModalComponent, modalConfig);
    editorDialog.afterClosed().subscribe((res: any) => {
      if (res?.edit) {
        this.surgeryForm.patchValue({ [field]: res.description });
      }
    });
  }

  onEditSubtopic(key: string) {
    const subtopics = this.surgeryForm.get("subtopics") as UntypedFormGroup;
    const currentValue = subtopics.get(key)?.value || "";
    // Responsive modal sizing based on screen width
    const isMobile = window.innerWidth < 810; // $screen-md-min breakpoint
    const modalConfig = {
      width: isMobile ? "95vw" : "75vw",
      maxWidth: isMobile ? "95vw" : "1200px",
      height: isMobile ? "90vh" : "80vh",
      maxHeight: isMobile ? "90vh" : "80vh",
      autoFocus: false,
      panelClass: "editor-modal-panelClass",
      data: { sno: 0, title: key, description: currentValue },
    };

    const editorDialog = this.matdialog.open(EditorModalComponent, modalConfig);
    editorDialog.afterClosed().subscribe((res: any) => {
      if (res?.edit) {
        subtopics.patchValue({ [key]: res.description });
      }
    });
  }

  onToggleRelatedTreatment(surgeryId: string) {
    const current: string[] =
      this.surgeryForm.get("relatedTreatments")?.value || [];
    const idx = current.indexOf(surgeryId);
    if (idx > -1) {
      current.splice(idx, 1);
    } else {
      current.push(surgeryId);
    }
    this.surgeryForm.patchValue({ relatedTreatments: [...current] });
  }

  isRelatedSelected(surgeryId: string): boolean {
    return (
      (this.surgeryForm.get("relatedTreatments")?.value || []).indexOf(
        surgeryId
      ) > -1
    );
  }
}

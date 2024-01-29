import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { EditorModalComponent } from "../editor-modal/editor-modal.component";
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { ApiService } from "src/app/shared/api.service";
import { URLConstant } from "src/app/apisURL/url";
import { ActivatedRoute, Router } from "@angular/router";
import { FaqsModalComponent } from "../faqs-modal/faqs-modal.component";
import { environment } from "src/environments/environment";

@Component({
  selector: "app-add-surgery",
  templateUrl: "./add-surgery.component.html",
  styleUrls: ["./add-surgery.component.scss"],
})
export class AddSurgeryComponent implements OnInit {
  constructor(
    private matdialog: MatDialog,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private apiService: ApiService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}
  surgeryForm!: FormGroup;
  acceptedFileType = ["image/jpeg", "image/jpg", "image/png"];
  activeAccordion!: string;
  departmentList: any = [];
  ngOnInit(): void {
    this.validateForm();
    this.getDepartmentList();
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
      seoTitle: ["Skull Base Surgery"],
      seoDescription: [],
      title: ["Skull Base Surgery"],
      name: ["Skull Base Surgery"],
      departmentId: [null, [Validators.required]],
      imageUrl: [environment.SURGERY_ICON_IMAGE_URL, [Validators.required]],
      description: [],
      components: this.createComponent(),
      faq: this.fb.array([]),
    });
    console.log(this.surgeryForm);
  }
  get control() {
    return this.surgeryForm.controls;
  }
  createComponent() {
    return this.fb.array([
      this.fb.group({
        sno: [1, [Validators.required]],
        title: ["skull base surgery", [Validators.required]],
        description: [
          `<p><strong><span style="color:#000000; font-size:20px">The</span></strong> 
        skull is composed of bones and cartilage that form the face and the cranium, 
        which surrounds the brain. You can feel the bones of the cranium on top of the skull. 
        The 5 bones that form the bottom, or base, of the cranium also form the eye socket, 
        roof of the nasal cavity, some of the sinuses, and the bones that surround the inner ear. 
        The skull base is a crowded and complicated area with different openings that the spinal cord, 
        many blood vessels, and nerves all pass through.</p><p>Skull base surgery may be done to remove 
        both noncancerous and cancerous growths, and abnormalities on the underside of the brain, the skull 
        base, or the top few vertebrae of the spinal column. Because this is such a difficult area to see and 
        reach, skull base surgery may be done by a minimally invasive endoscopic procedure. In this procedure, 
        the surgeon inserts instruments through the natural openings in the skull—the nose or mouth—or by making 
        a small hole just above the eyebrow. This type of surgery requires a team of specialists that may include 
        ENT (ear, nose, and throat) surgeons, maxillofacial surgeons, neurosurgeons, and radiologists.</p>`,
          [Validators.required],
        ],
        image: this.fb.array(
          [this.fb.control(environment.SURGERY_IMAGE_URL)],
          this.validateImagesArray()
        ),
      }),
      this.fb.group({
        sno: [2, [Validators.required]],
        title: ["What is skull base surgery used for?", [Validators.required]],
        description: [
          `<p>These are some of the growths and conditions that may be treated by skull base surgery:
        </p><ul>
        <li><p>Growths caused by infections</p></li>
        <li><p>Pituitary tumours</p></li>
        <li><p>Chordomas, a slow-growing bone tumour most often found at the base of the skull</p></li>
        <li><p>Trigeminal neuralgia, an intense pain on one side of the face</p></li>
        <li><p>Craniopharyngiomas, growths that occur near the pituitary gland<br></p></li></ul>`,
          [Validators.required],
        ],
      }),
      this.fb.group({
        sno: [3, [Validators.required]],
        title: ["Types of skull base surgery", [Validators.required]],
        description: [
          `<p>Skull base surgery can be done in two main ways. Although the preferred method 
          is endoscopic, open surgery is also an option, depending on the type of growth that 
          needs to be removed and its location:</p><p><strong><span style="color:#0052cc;">Endoscopic 
          or minimally</span></strong>: invasive skull base surgery. This type of surgery usually does not 
          require a large incision. A surgeon may make a small opening inside the nose to allow a neurosurgeon 
          to remove a growth through a thin lighted tube called an endoscope. An MRI is a type of picture 
          taken of the skull base using magnets and a computer and may be done by a radiology specialist 
          while the surgical specialists are operating to help them make sure all of the growth has been 
          removed.<br><br><strong><span style="color:#0052cc;">Traditional or open skull base surgery:
          </span></strong> This type of surgery may require incisions in the facial area and in the skull. 
          Parts of bone may need to be removed so that the growth can be reached and removed. An operating 
          room microscope is often used for this type of surgery.</p>`,
          [Validators.required],
        ],
      }),
      this.fb.group({
        sno: [4, [Validators.required]],
        title: ["Symptoms"],
        description: [
          `<p>You may have possible symptoms from a growth or abnormality in the skull base area. 
        Symptoms will depend on the size, type and location of the growth or abnormality, 
        and may include:</p>`,
        ],
        image: this.fb.array([]),
      }),
      this.fb.group({
        sno: [5, [Validators.required]],
        title: ["Diagnosis", [Validators.required]],
        description: [
          `<p>The diagnosis of growths or abnormalities that may require skull base surgery 
          is based on your symptoms and a physical exam. Because this area can't be seen directly, 
          these exams and imaging studies are important parts of the diagnosis:</p><p><strong>
          <span style=\"color:#0052cc;\">Brain imaging studies</span></strong>: Special tests such as MRI 
          (magnetic resonance imaging), MRA (magnetic resonance angiogram), PET (positron emission tomography) 
          and CT (computed tomography) scans create pictures of the skull to help your medical team see a growth 
          or abnormality.<br><br><strong><span style=\"color:#0052cc;\">Biopsy</span></strong>: A small piece of 
          a growth in the skull base may be taken out and looked at under a microscope. A biopsy may be done using 
          an endoscope placed through the nose and sinuses. Biopsies may also be done by fine need aspiration, or 
          excisional biopsy.<br><br><strong><span style=\"color:#0052cc;\">Other tests</span></strong>: Your balance, 
          cranial nerves, muscle activity, vision, and hearing may all be checked. Studies or scans of other areas 
          and systems of the body may also be checked.</p>`,
          [Validators.required],
        ],
      }),
      this.fb.group({
        sno: [6, [Validators.required]],
        title: ["Treatment", [Validators.required]],
        description: [
          `<p>In addition to endoscopic and open skull base surgery, these treatments may be needed, 
          depending on the type of growth or abnormality of the skull base:</p><p><strong>
          <span style=\"color:#0052cc;\">Chemotherapy</span></strong>: These are drugs used to treat 
          growths caused by cancer.</p><p><br><strong><span style=\"color:#0052cc;\">Radiation therapy
          </span></strong>: X-ray treatment may be used to control a growth in the skull base that can't 
          be completely.</p><p><br><strong><span style=\"color:#0052cc;\">Gamma knife</span></strong>: 
          This is a special type of radiation therapy that uses precise X-ray beams to target a growth 
          in the skull base.</p><p><br><strong> <span style=\"color:#0052cc;\">Proton beam therapy</span></strong>: 
          This is another type of radiation therapy designed to have greater accuracy and dosing for tumors.</p>
          <p><br><strong> <span style=\"color:#0052cc;\">Particle therapy</span></strong>: This is the newest form 
          of radiotherapy. It uses high energy particles with fewer side effects.</p>`,
          [Validators.required],
        ],
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
        .Postdata(URLConstant.addSurgery, this.surgeryForm.value, {})
        .subscribe({
          next: (res: any) => {
            console.log(res);
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
      const formArray = control as FormArray;
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
  onAddFaqs(edit: boolean = false, i?: number) {
    const faqDialog = this.matdialog.open(FaqsModalComponent, {
      width: "720px",
      data: {
        edit,
        patchValue: this.faqArray.get(String(i))?.value,
      },
    });
    faqDialog.afterClosed().subscribe((res: any) => {
      console.log(res);

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

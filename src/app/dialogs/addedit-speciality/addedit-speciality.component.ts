import { Component, Inject, OnInit, OnDestroy } from "@angular/core";
import { UntypedFormBuilder, Validators, FormGroup } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Editor, Toolbar, toHTML } from "ngx-editor";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { URLConstant } from "src/app/apisURL/url";
import { ApiService } from "src/app/shared/api.service";
import { SpecializationService } from "src/app/services/specialization.service";

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

  private allSpecializations: { _id: string; name: string }[] = [];
  private destroy$ = new Subject<void>();

  allPrimarySuggestions: string[] = [];
  allSecondarySuggestions: string[] = [];
  
  selectedPrimarySpecializations: string[] = [];
  selectedSecondarySpecializations: string[] = [];
  filteredPrimarySuggestions: string[] = [];
  filteredSecondarySuggestions: string[] = [];

  selectedPrimaryIds: string[] = [];
  selectedSecondaryIds: string[] = [];

  constructor(
    private fb: UntypedFormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<AddeditSpecialityComponent>,
    private apiService: ApiService,
    private specService: SpecializationService
  ) {}

  ngOnInit(): void {
    this.specService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (specializations) => {
          this.allSpecializations = specializations;
          this.allPrimarySuggestions = this.allSpecializations.map(spec => spec.name);
          this.allSecondarySuggestions = this.allSpecializations.map(spec => spec.name);
        },
        error: (err) => {
          console.error('Failed to load specializations', err);
          this.allPrimarySuggestions = [];
          this.allSecondarySuggestions = [];
        }
      });

    this.initFaqForm();
    this.setupPrimarySpecializationSearch();
    this.setupSecondarySpecializationSearch();

    this.header = this.data?.creation || "";
    this.faq = this.data?.type || "";

    this.loadBreadcrumbSpecializations();

    this.addFaqForm.patchValue({
      question: this.data?.content || "",
      profilePic: this.data?.image || "",
      description: this.data?.description || "",
      links: this.data?.links || "",
    });

    if (this.data?.sections) {
      this.additionalSections = this.data.sections.map((section: any) => {
        const editorInstance = new Editor();
        editorInstance.setContent(section.content || "");
        return {
          title: section.title || "",
          editor: editorInstance,
          content: section.content || "",
        };
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.editor.destroy();
    this.editor1.destroy();
    this.additionalSections.forEach((section) => section.editor.destroy());
  }

  loadBreadcrumbSpecializations(): void {
    if (this.data?.breadcrumb && Array.isArray(this.data.breadcrumb)) {
      this.selectedPrimarySpecializations = [];
      this.selectedSecondarySpecializations = [];
      this.selectedPrimaryIds = [];
      this.selectedSecondaryIds = [];

      this.data.breadcrumb.forEach((breadcrumb: any) => {
        if (breadcrumb.flag === 1) {
          if (!this.selectedPrimarySpecializations.includes(breadcrumb.name)) {
            this.selectedPrimarySpecializations.push(breadcrumb.name);
            this.selectedPrimaryIds.push(breadcrumb._id);
          }
        } else if (breadcrumb.flag === 2) {
          if (!this.selectedSecondarySpecializations.includes(breadcrumb.name)) {
            this.selectedSecondarySpecializations.push(breadcrumb.name);
            this.selectedSecondaryIds.push(breadcrumb._id);
          }
        }
      });
    }
  }

  initFaqForm() {
    this.addFaqForm = this.fb.group({
      profilePic: [""],
      question: ["", [Validators.required]],
      description: [""],
      links: [""],
      tags: [[]],
      tagSearch: [""],
      primarySpecializationSearch: [""],
      secondarySpecializationSearch: [""]
    });
  }

  get f() {
    return this.addFaqForm.controls;
  }

  selectPrimarySpecialization(tag: string) {
    if (!this.selectedPrimarySpecializations.includes(tag)) {
      this.selectedPrimarySpecializations.push(tag);
      
      const matchingSpec = this.allSpecializations.find(spec => spec.name === tag);
      if (matchingSpec && !this.selectedPrimaryIds.includes(matchingSpec._id)) {
        this.selectedPrimaryIds.push(matchingSpec._id);
      }
      
      this.addFaqForm.get('primarySpecializationSearch')?.setValue('');
      this.filteredPrimarySuggestions = [];
    }
  }

  removePrimarySpecialization(index: number) {
    this.selectedPrimarySpecializations.splice(index, 1);
    this.selectedPrimaryIds.splice(index, 1);
    this.filteredPrimarySuggestions = [];
  }

  setupPrimarySpecializationSearch() {
    this.addFaqForm.get('primarySpecializationSearch')?.valueChanges.subscribe((value: string) => {
      if (!value) {
        this.filteredPrimarySuggestions = [];
        return;
      }
      this.filteredPrimarySuggestions = this.allPrimarySuggestions.filter(item =>
        item.toLowerCase().includes(value.toLowerCase()) &&
        !this.selectedPrimarySpecializations.includes(item) &&
        !this.selectedSecondarySpecializations.includes(item)
      );
    });
  }

  selectSecondarySpecialization(tag: string) {
    if (!this.selectedSecondarySpecializations.includes(tag)) {
      this.selectedSecondarySpecializations.push(tag);
      
      const matchingSpec = this.allSpecializations.find(spec => spec.name === tag);
      if (matchingSpec && !this.selectedSecondaryIds.includes(matchingSpec._id)) {
        this.selectedSecondaryIds.push(matchingSpec._id);
      }
      
      this.addFaqForm.get('secondarySpecializationSearch')?.setValue('');
      this.filteredSecondarySuggestions = [];
    }
  }

  removeSecondarySpecialization(index: number) {
    this.selectedSecondarySpecializations.splice(index, 1);
    this.selectedSecondaryIds.splice(index, 1);
  }

  setupSecondarySpecializationSearch() {
    this.addFaqForm.get('secondarySpecializationSearch')?.valueChanges.subscribe((value: string) => {
      if (!value) {
        this.filteredSecondarySuggestions = [];
        return;
      }
      this.filteredSecondarySuggestions = this.allSecondarySuggestions.filter(item =>
        item.toLowerCase().includes(value.toLowerCase()) &&
        !this.selectedPrimarySpecializations.includes(item) &&
        !this.selectedSecondarySpecializations.includes(item)
      );
    });
  }

  addEditdata() {
    this.submitted = true;

    if (this.addFaqForm.valid) {
      const specializations: any[] = [];
      
      this.selectedPrimarySpecializations.forEach((spec, index) => {
        specializations.push({ 
          _id: this.selectedPrimaryIds[index] || null,
          name: spec, 
          flag: 1 
        });
      });

      this.selectedSecondarySpecializations.forEach((spec, index) => {
        specializations.push({ 
          _id: this.selectedSecondaryIds[index] || null,
          name: spec, 
          flag: 2 
        });
      });

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
        tags: this.addFaqForm.value.tags,
        breadcrumb: specializations,
        sections: sectionsData,
      });
    } else {
      if (!this.selectedPrimarySpecializations.length) {
        alert('Please select at least one Primary Specialization');
      }
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
}

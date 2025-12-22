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

  // ⭐ SPECIALIZATION PROPERTIES - CLASS LEVEL
  allPrimarySuggestions: string[] = [
    'Dental Surgeon', 'Implantologist', 'Orthodontist', 'Endodontist', 
    'Prosthodontist', 'Periodontist', 'Oral Surgeon', 'Pediatric Dentist'
  ];

  allSecondarySuggestions: string[] = [
    'Cosmetic Dentistry', 'Root Canal', 'Dental Implants', 'Braces', 
    'Teeth Whitening', 'Veneers', 'Crowns', 'Bridges'
  ];

  selectedPrimarySpecializations: string[] = [];
  selectedSecondarySpecializations: string[] = [];
  filteredPrimarySuggestions: string[] = [];
  filteredSecondarySuggestions: string[] = [];

  constructor(
    private fb: UntypedFormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<AddeditSpecialityComponent>,
    private apiService: ApiService
  ) {
    console.log("Dialog data:", data);
  }

  ngOnInit(): void {
    this.initFaqForm();
    this.setupPrimarySpecializationSearch();
    this.setupSecondarySpecializationSearch();

    this.header = this.data?.creation || "";
    this.faq = this.data?.type || "";

    // Load existing specializations
    if (this.data?.specializations) {
      this.data.specializations.forEach((spec: any) => {
        if (spec.flag === 1) {
          this.selectedPrimarySpecializations = [spec.name];
        } else if (spec.flag === 2) {
          if (!this.selectedSecondarySpecializations.includes(spec.name)) {
            this.selectedSecondarySpecializations.push(spec.name);
          }
        }
      });
    }

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
        editorInstance.setContent(section.content || "");
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

  // ⭐ PRIMARY SPECIALIZATION METHODS
  selectPrimarySpecialization2(tag: string) {
    if (!this.selectedPrimarySpecializations.includes(tag)) {
      this.selectedPrimarySpecializations = [tag]; // Only 1 primary allowed
      this.addFaqForm.get('primarySpecializationSearch')?.setValue('');
      this.filteredPrimarySuggestions = [];
      console.log('Primary selected:', tag);
    }
  }

  // ⭐ NOW ALLOWS MULTIPLE PRIMARY SELECTIONS
selectPrimarySpecialization(tag: string) {
  if (!this.selectedPrimarySpecializations.includes(tag)) {
    this.selectedPrimarySpecializations.push(tag); // ⭐ CHANGED: push instead of = [tag]
    this.addFaqForm.get('primarySpecializationSearch')?.setValue('');
    this.filteredPrimarySuggestions = [];
    console.log('Primary selected:', tag);
  }
}


 removePrimarySpecialization(index: number) {
  this.selectedPrimarySpecializations.splice(index, 1);
  // ⭐ Trigger change detection for suggestions
  this.filteredPrimarySuggestions = [];
  console.log('Primary removed, remaining:', this.selectedPrimarySpecializations);
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

  // ⭐ SECONDARY SPECIALIZATION METHODS
  selectSecondarySpecialization(tag: string) {
    if (!this.selectedSecondarySpecializations.includes(tag)) {
      this.selectedSecondarySpecializations.push(tag); // Multiple secondary allowed
      this.addFaqForm.get('secondarySpecializationSearch')?.setValue('');
      this.filteredSecondarySuggestions = [];
      console.log('Secondary selected:', tag);
    }
  }

  removeSecondarySpecialization(index: number) {
    this.selectedSecondarySpecializations.splice(index, 1);
    console.log('Secondary removed, remaining:', this.selectedSecondarySpecializations);
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

    if (this.addFaqForm.valid && this.selectedPrimarySpecializations.length > 0) {
      console.log('Selected Tags:', this.addFaqForm.value.tags);

      // Create specialization array in REQUIRED format
      const specializations: any[] = [];
      
      // Primary specialization(s) - flag: 1
      this.selectedPrimarySpecializations.forEach(spec => {
        console.log('Primary Specialization:', { name: spec, flag: 1 });
        specializations.push({ name: spec, flag: 1 });
      });

      // Secondary specialization(s) - flag: 2
      this.selectedSecondarySpecializations.forEach(spec => {
        console.log('Secondary Specialization:', { name: spec, flag: 2 });
        specializations.push({ name: spec, flag: 2 });
      });

      console.log('All Specializations:', specializations);

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
        specializations: specializations,
        sections: sectionsData,
      });
    } else {
      console.log('Form invalid or no primary specialization selected');
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

  ngOnDestroy(): void {
    this.editor.destroy();
    this.editor1.destroy();
    this.additionalSections.forEach((section) => section.editor.destroy());
  }
}

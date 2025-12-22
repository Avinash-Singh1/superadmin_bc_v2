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

  // ⭐ ALL YOUR SPECIALIZATIONS WITH _id (PASTE YOUR COMPLETE LIST HERE)
    private allSpecializations: { _id: string; name: string }[] = [
    // First array
    { _id: '65716eda1eece2ff479fba57', name: 'Dentist' },
    { _id: '657174f61eece2ff479fd0e1', name: 'Orthopedic Surgeon' },
    { _id: '6572afca1eece2ff47a04884', name: 'Joint Replacement Surgeon' },
    { _id: '6572df911eece2ff47a08a7c', name: 'Orthopedist' },
    { _id: '6572eca74ac522e644da1c0d', name: 'Implantologist' },
    { _id: '6572ece24ac522e644da1c14', name: 'Dental Surgeon' },
    { _id: '6572f2204ac522e644da1da6', name: 'Orthodontist' },
    { _id: '657973484ac522e644dc99ff', name: 'Cardiologist' },
    { _id: '657973944ac522e644dc9a1f', name: 'Dermatologist' },
    { _id: '657973ea4ac522e644dc9a2d', name: 'General Physician' },
    { _id: '657974524ac522e644dc9a35', name: 'Gynecologist/ Obstetrician' },
    { _id: '657974a54ac522e644dc9a3d', name: 'Oncologist' },
    { _id: '657974f44ac522e644dc9a45', name: 'Ophthalmologist' },
    { _id: '657975554ac522e644dc9a59', name: 'Pediatrician' },
    { _id: '657975ae4ac522e644dc9ad1', name: 'Physiotherapist' },
    { _id: '657975fa4ac522e644dc9afd', name: 'Psychiatrist' },
    { _id: '657976394ac522e644dc9b0b', name: 'Radiologist' },
    { _id: '6579766f4ac522e644dc9b13', name: 'Sexologist' },
    { _id: '657976e14ac522e644dc9b7b', name: 'Urologist' },
    { _id: '65797bc64ac522e644dca22f', name: 'ENT Specialist' },
    
    // Second array
    { _id: '65797c254ac522e644dca249', name: 'Neurologist' },
    { _id: '65797c994ac522e644dca250', name: 'Anesthesiologist' },
    { _id: '65797d094ac522e644dca257', name: 'Endocrinologist' },
    { _id: '65797d634ac522e644dca25e', name: 'Pulmonologist' },
    { _id: '65797d8b4ac522e644dca265', name: 'Epidemiologist' },
    { _id: '65797dc14ac522e644dca273', name: 'Gastroenterologist' },
    { _id: '65797ded4ac522e644dca27a', name: 'Geriatrician' },
    { _id: '65797e0e4ac522e644dca281', name: 'Nephrologist' },
    { _id: '657981d24ac522e644dca2e2', name: 'Allergists Immunologists' },
    { _id: '6579830d4ac522e644dca2f4', name: 'Infertility Specialist' },
    { _id: '657993fa4ac522e644dcaefd', name: 'Ayurveda' },
    { _id: '657994ac4ac522e644dcaf06', name: 'Homeopath' },
    { _id: '6579962b4ac522e644dcaf39', name: 'General Surgeon' },
    { _id: '657ab4d7f82479da62e084d9', name: 'Gynecologist' },
    { _id: '657c2889f82479da62e25479', name: 'Laparoscopic Surgeon' },
    { _id: '657c28d4f82479da62e25493', name: 'Colposcopist' },
    { _id: '657d779ccf5c8d9003d952e2', name: 'Diabetologist' },
    { _id: '657d8718cf5c8d9003d95f45', name: 'Family Physician' },
    { _id: '657d8770cf5c8d9003d96019', name: 'Fetal Medicine Specialist' },
    { _id: '6583cee33f64ddaad5435cff', name: 'Endodontist' },
    
    // Third array
    { _id: '6583cf4d3f64ddaad5435ee9', name: 'Conservative Dentist' },
    { _id: '659646d90fb869e2132eb2fb', name: 'Reproductive Endocrinologist' },
    { _id: '65aa477c4a9118961782486c', name: 'Preventive Cardiologist' },
    { _id: '65aa494f4a91189617824908', name: 'Dietitian Nutritionist' },
    { _id: '6603f76aa051f55e39d9a5d8', name: 'Cosmetologist' },
    { _id: '660548a06a89dc628994277f', name: 'Psychologist' },
    { _id: '660a467d0f637f6860e4a3bb', name: 'Gastroenterologist' },
    { _id: '6614feb3b3c929b7184b7335', name: 'Cosmetic/Aesthetic Dentist' },
    { _id: '66165364e29f267a386ecce7', name: 'Prosthodontist' },
    { _id: '661773942e3ab81807f2099e', name: 'Pediatric Dentist' },
    { _id: '6622159f6a469505783c35a8', name: 'Urological Surgeon' },
    { _id: '662232a8b5afa028989c4977', name: 'Andrologist' },
    { _id: '66278946259b8d3b62d864f0', name: 'Hepatologist' },
    { _id: '662b3a195d17aee50a50201c', name: 'Interventional Radiology' },
    { _id: '663db5f78e0c4388c882fe70', name: 'Radiation Oncologist' },
    { _id: '6641c6ee381f7f50008a46e4', name: 'Oral and Maxillofacial Surgeon' },
    { _id: '6642f13acae94f0e074f7bdb', name: 'Trichologist' },
    { _id: '6642f2a75db5bb87b9ed474b', name: 'Aesthetic Dermatologist' },
    { _id: '6642f381cae94f0e074f7c39', name: 'Dermatosurgeon' },
    { _id: '667e78b003f02de757cc10bc', name: 'Plastic Surgeon' },
    
    // Fourth array
    { _id: '66825e3119e39b61e500bff5', name: 'Kidney Transplant Surgeon' },
    { _id: '66d2c6ec46410552826d7e60', name: 'Hair Transplant Surgeon' },
    { _id: '66d2c6f39d944695a5951847', name: 'Pediatric Dermatologist' },
    { _id: '6788f57f0d6200c1b1609515', name: 'Veterinarian' },
    { _id: '6788f6720d6200c1b16099a4', name: 'Veterinary Surgeon' },
    { _id: '67cad390787c2e2823040ee3', name: 'Pediatric Cardiologist' },
    { _id: '67ceb7c3a505cc222e6ece70', name: 'Medical Oncologist' },
    { _id: '67ceb7d3a505cc222e6ece76', name: 'Surgical Oncologist' },
    { _id: '67ceb7f5734ffcfe9152a802', name: 'Hematologic Oncologist' },
    { _id: '67ceb7fc734ffcfe9152a808', name: 'Gynecologic Oncologist' },
    { _id: '67ceb805734ffcfe9152a80e', name: 'Head And Neck Oncologist' },
    { _id: '67ceb80c734ffcfe9152a8d2', name: 'Pediatric Oncologist' },
    { _id: '67ceb814734ffcfe9152a8d8', name: 'Orthopedic Oncologist' },
    { _id: '67e24f2bc38b8ff3ba158df6', name: 'Neonatologist' },
    { _id: '686f94dd27c1048998cba1dd', name: 'Clinical Pharmacist' }
  ];

  // ⭐ SAME LIST FOR BOTH PRIMARY & SECONDARY (unified suggestions)
  allPrimarySuggestions: string[] = [];
  allSecondarySuggestions: string[] = [];
  
  selectedPrimarySpecializations: string[] = [];
  selectedSecondarySpecializations: string[] = [];
  filteredPrimarySuggestions: string[] = [];
  filteredSecondarySuggestions: string[] = [];

  // ⭐ TRACK _id MAPPINGS
  selectedPrimaryIds: string[] = [];
  selectedSecondaryIds: string[] = [];

  constructor(
    private fb: UntypedFormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<AddeditSpecialityComponent>,
    private apiService: ApiService
  ) {
    console.log("Dialog data:", data);
  }

  ngOnInit(): void {
    // ⭐ INITIALIZE SUGGESTIONS FROM SPECIALIZATIONS
    this.allPrimarySuggestions = this.allSpecializations.map(spec => spec.name);
    this.allSecondarySuggestions = this.allSpecializations.map(spec => spec.name);

    this.initFaqForm();
    this.setupPrimarySpecializationSearch();
    this.setupSecondarySpecializationSearch();

    this.header = this.data?.creation || "";
    this.faq = this.data?.type || "";

    // ⭐ LOAD BREADCRUMB DATA
    this.loadBreadcrumbSpecializations();

    this.addFaqForm.patchValue({
      question: this.data?.content || "",
      profilePic: this.data?.image || "",
      description: this.data?.description || "",
      links: this.data?.links || "",
    });

    // Initialize additional sections
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

  // ⭐ LOAD BREADCRUMB SPECIALIZATIONS WITH _id TRACKING
  loadBreadcrumbSpecializations(): void {
    console.log('Loading breadcrumb specializations:', this.data?.breadcrumb);
    
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

      console.log('Loaded Primary:', this.selectedPrimarySpecializations);
      console.log('Loaded Secondary:', this.selectedSecondarySpecializations);
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
  selectPrimarySpecialization(tag: string) {
    if (!this.selectedPrimarySpecializations.includes(tag)) {
      this.selectedPrimarySpecializations.push(tag);
      
      // ⭐ FIND AND STORE _id
      const matchingSpec = this.allSpecializations.find(spec => spec.name === tag);
      if (matchingSpec && !this.selectedPrimaryIds.includes(matchingSpec._id)) {
        this.selectedPrimaryIds.push(matchingSpec._id);
      }
      
      this.addFaqForm.get('primarySpecializationSearch')?.setValue('');
      this.filteredPrimarySuggestions = [];
      console.log('Primary selected:', tag, 'ID:', matchingSpec?._id);
    }
  }

  removePrimarySpecialization(index: number) {
    this.selectedPrimarySpecializations.splice(index, 1);
    this.selectedPrimaryIds.splice(index, 1);
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
      this.selectedSecondarySpecializations.push(tag);
      
      // ⭐ FIND AND STORE _id
      const matchingSpec = this.allSpecializations.find(spec => spec.name === tag);
      if (matchingSpec && !this.selectedSecondaryIds.includes(matchingSpec._id)) {
        this.selectedSecondaryIds.push(matchingSpec._id);
      }
      
      this.addFaqForm.get('secondarySpecializationSearch')?.setValue('');
      this.filteredSecondarySuggestions = [];
      console.log('Secondary selected:', tag, 'ID:', matchingSpec?._id);
    }
  }

  removeSecondarySpecialization(index: number) {
    this.selectedSecondarySpecializations.splice(index, 1);
    this.selectedSecondaryIds.splice(index, 1);
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

  // ⭐ UPDATED addEditdata WITH PROPER FLAGS & _ids
  addEditdata() {
    this.submitted = true;

    if (this.addFaqForm.valid) {
    // if (this.addFaqForm.valid && this.selectedPrimarySpecializations.length > 0) {
      console.log('Selected Tags:', this.addFaqForm.value.tags);

      const specializations: any[] = [];
      
      // Primary - flag: 1
      this.selectedPrimarySpecializations.forEach((spec, index) => {
        specializations.push({ 
          _id: this.selectedPrimaryIds[index] || null,
          name: spec, 
          flag: 1 
        });
      });

      // Secondary - flag: 2
      this.selectedSecondarySpecializations.forEach((spec, index) => {
        specializations.push({ 
          _id: this.selectedSecondaryIds[index] || null,
          name: spec, 
          flag: 2 
        });
      });

      console.log('All Specializations with flags:', specializations);

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

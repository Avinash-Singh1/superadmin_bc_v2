import { Component, OnInit } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { ToastrService } from "ngx-toastr";
import { debounceTime, distinctUntilChanged, firstValueFrom, interval, Subscription } from "rxjs";
import { URLConstant } from "src/app/apisURL/url";
import { ApiService } from "src/app/shared/api.service";
import { ngxCsv } from "ngx-csv/ngx-csv";
import { DeleteConfirmationComponent } from "src/app/dialogs/delete-confirmation/delete-confirmation.component";
import { DeleteUserService } from "src/app/services/delete-user.service"; 
import { SitemapService } from "../sitemap.service";

export interface PeriodicElement {
  name: string;
  position: string;
  weight: string;
  symbol: string;
  mobile: number;
  email: string;
  age: number;
  bloodgroup: string;
}

const ELEMENT_DATA: PeriodicElement[] = [];

interface SitemapTypeItem {
  type: string;
  label: string;
  description: string;
  status: 'idle' | 'syncing' | 'success' | 'error';
  message?: string;
  urlCount?: number;
}

@Component({
  selector: "app-patients-list",
  templateUrl: "./patients-list.component.html",
  styleUrls: ["./patients-list.component.scss"],
})
export class PatientsListComponent implements OnInit {
  displayedColumns: string[] = [
    "position",
    "name",
    "Gender",
    "Address",
    "Mobile",
    "Email",
    "Age",
    "BloodGroup",
    "Action",
  ];
  dataSource: any;
  page = 1;
  gender: boolean = false;
  totalLength: any;
  age: boolean = false;
  bloodGroup: boolean = false;
  isChecked: any = false;
  patientLists: any;
  isSelected: boolean = false;
  bloodGroups: any;
  bloodGroupList: any = [{}];
  patientForm: any;
  ageParam: any = [];
  itemsPerPage: number = 10;
  bloodGroupParam: any = [];
  search = new UntypedFormControl();
  sortBy: any = {
    sort: "",
    sortOrder: "",
  };
  fullNameASC: boolean = true;
  fullNameDESC: boolean = false;
  ageASC: boolean = true;
  ageDESC: boolean = false;
  bloodASC: boolean = true;
  bloodDESC: boolean = false;
  genderASC: boolean = true;
  genderDESC: boolean = false;
  data: any = [];

  ageLimit = [
    {
      age: "Below 18",
      value: "1",
      selected: false,
    },
    {
      age: "18-24",
      value: "2",
      selected: false,
    },
    {
      age: "25-34",
      value: "3",
      selected: false,
    },
    {
      age: "35-44",
      value: "4",
      selected: false,
    },
    {
      age: "55-64",
      value: "5",
      selected: false,
    },
    {
      age: "65 +",
      value: "6",
      selected: false,
    },
  ];
  genders = [
    {
      gender: "Male",
      value: "male",
    },
    {
      gender: "Female",
      value: "female",
    },
  ];
  bloodType = [
    {
      bloodgroup: "A+",
      value: "1",
      selected: false,
    },
    {
      bloodgroup: "B+",
      value: "2",
      selected: false,
    },
    {
      bloodgroup: "A-",
      value: "3",
      selected: false,
    },
    {
      bloodgroup: "B-",
      value: "4",
      selected: false,
    },
    {
      bloodgroup: "O+",
      value: "5",
      selected: false,
    },
    {
      bloodgroup: "O-",
      value: "6",
      selected: false,
    },
    {
      bloodgroup: "AB+",
      value: "7",
      selected: false,
    },
    {
      bloodgroup: "AB-",
      value: "8",
      selected: false,
    },
  ];

  constructor(
    private dialog: MatDialog,
    public toastr: ToastrService,
    public apiservice: ApiService,
    public deleteUserService:DeleteUserService,
    public fb: UntypedFormBuilder,
    private sitemapService: SitemapService
  ) {}

  ngOnInit(): void {
  }

loading = false;
message = '';

// ── Per-type sitemap sync ──────────────────────────────────────────────

sitemapTypes: SitemapTypeItem[] = [
  { type: 'index',                    label: 'Index / Static Pages',         description: 'Homepage and core static pages',                         status: 'idle' },
  { type: 'cities',                   label: 'Cities',                       description: 'City homepages for all covered cities',                  status: 'idle' },
  { type: 'doctor',                   label: 'Doctors',                      description: 'Doctor profile pages by city',                           status: 'idle' },
  { type: 'hospital',                 label: 'Hospitals',                    description: 'Hospital pages by city',                                 status: 'idle' },
  { type: 'treatments',               label: 'Treatments',                   description: 'Surgery and treatment landing pages',                    status: 'idle' },
  { type: 'medicines',                label: 'Medicines',                    description: 'Medicine category pages (Myupchar)',                     status: 'idle' },
  { type: 'specialization',           label: 'Specializations',              description: 'City + locality wise specialization pages',              status: 'idle' },
  { type: 'service',                  label: 'Services',                     description: 'City-wise service pages',                                status: 'idle' },
  { type: 'city-wise-specialization', label: 'City-Wise Specialization',     description: 'All city × specialization combinations',                 status: 'idle' },
  { type: 'locality-wise-services',   label: 'Locality-Wise Services',       description: 'City × service × locality pages',                        status: 'idle' },
  { type: 'hospital-city-localities', label: 'Hospital City Localities',     description: 'City and locality hospital listing pages',               status: 'idle' },
  { type: 'clinic-city-localities',   label: 'Clinic City Localities',       description: 'City and locality clinic listing pages',                 status: 'idle' },
  { type: 'doctor-city-localities',   label: 'Doctor City Localities',       description: 'City and locality doctor listing pages',                 status: 'idle' },
  { type: 'video-consultation-hospitals', label: 'Video Consultation Hospitals', description: 'Video-only hospital profile pages',                  status: 'idle' },
  { type: 'city-clinic-hospital-types',   label: 'City Clinic & Hospital Types', description: 'Per-city clinic/hospital type pages (heaviest)',     status: 'idle' },
];

sequentialSyncing = false;
currentSequentialIndex = -1;
sequentialCountdown = 0;
syncCancelled = false;
private countdownSub?: Subscription;

syncSingleType(item: SitemapTypeItem): void {
  item.status = 'syncing';
  item.message = undefined;
  item.urlCount = undefined;
  const token = localStorage.getItem('token1') || '';
  this.sitemapService.syncSitemapByType(token, item.type).subscribe({
    next: (res) => {
      item.status = res.success ? 'success' : 'error';
      item.message = res.message || (res.success ? '✅ Done' : res.error || '❌ Failed');
      item.urlCount = res.urlCount;
    },
    error: (err) => {
      item.status = 'error';
      item.message = err.error?.error || '❌ Failed to sync';
    },
  });
}

async syncAllSequential(): Promise<void> {
  this.sequentialSyncing = true;
  this.syncCancelled = false;
  this.currentSequentialIndex = -1;
  this.sitemapTypes.forEach((t) => { t.status = 'idle'; t.message = undefined; t.urlCount = undefined; });
  const token = localStorage.getItem('token1') || '';
  for (let i = 0; i < this.sitemapTypes.length; i++) {
    if (this.syncCancelled) break;
    this.currentSequentialIndex = i;
    const item = this.sitemapTypes[i];
    item.status = 'syncing';
    item.message = undefined;
    item.urlCount = undefined;
    try {
      const res = await firstValueFrom(this.sitemapService.syncSitemapByType(token, item.type));
      item.status = res.success ? 'success' : 'error';
      item.message = res.message || (res.success ? '✅ Done' : res.error || '❌ Failed');
      item.urlCount = res.urlCount;
    } catch (err: any) {
      item.status = 'error';
      item.message = err.error?.error || '❌ Failed to sync';
    }
    if (!this.syncCancelled && i < this.sitemapTypes.length - 1) {
      await this.startCountdown(60);
    }
  }
  this.sequentialSyncing = false;
  this.currentSequentialIndex = -1;
  this.sequentialCountdown = 0;
}

private startCountdown(seconds: number): Promise<void> {
  return new Promise<void>((resolve) => {
    this.sequentialCountdown = seconds;
    this.countdownSub = interval(1000).subscribe(() => {
      if (this.syncCancelled) {
        this.countdownSub?.unsubscribe();
        resolve();
        return;
      }
      this.sequentialCountdown--;
      if (this.sequentialCountdown <= 0) {
        this.countdownSub?.unsubscribe();
        resolve();
      }
    });
  });
}

stopSequentialSync(): void {
  this.syncCancelled = true;
  this.countdownSub?.unsubscribe();
  this.sequentialCountdown = 0;
  this.sequentialSyncing = false;
  this.currentSequentialIndex = -1;
  this.sitemapTypes.forEach((t) => { if (t.status === 'syncing') t.status = 'idle'; });
}

syncSitemap() {
  this.loading = true;
  this.message = '';

  const token = localStorage.getItem('token1') || '';

  this.sitemapService.syncSitemap(token).subscribe({
    next: (res) => {
      this.message = res.success
        ? res.message || '✅ Sitemap synced successfully'
        : res.error || '❌ Failed';
      this.loading = false;
    },
    error: (err) => {
      console.error(err);
      this.message = '❌ Failed to sync sitemap';
      this.loading = false;
    },
  });
}

// ── Cache Clearing ─────────────────────────────────────────────────────

cacheClearLoading = false;
cacheClearMessage = '';

clearAllCaches(): void {
  this.cacheClearLoading = true;
  this.cacheClearMessage = '';
  const token = localStorage.getItem('token1') || '';
  this.sitemapService.clearCache(token).subscribe({
    next: (res) => {
      this.cacheClearLoading = false;
      if (res.success) {
        this.cacheClearMessage = res.message || '✅ All caches cleared';
        this.toastr.success(this.cacheClearMessage, 'Cache Cleared');
      } else {
        this.cacheClearMessage = res.error || '❌ Failed to clear caches';
        this.toastr.error(this.cacheClearMessage, 'Error');
      }
    },
    error: (err) => {
      this.cacheClearLoading = false;
      this.cacheClearMessage = err.error?.error || '❌ Failed to clear caches';
      this.toastr.error(this.cacheClearMessage, 'Error');
    },
  });
}

}
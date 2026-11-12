import { Component, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { ToastrService } from "ngx-toastr";
import { debounceTime, distinctUntilChanged } from "rxjs";
import { URLConstant } from "src/app/apisURL/url";
import { ApiService } from "src/app/shared/api.service";
import { environment } from "src/environments/environment";
import { AddPreOnboardDoctorComponent } from "./dialogs/add-pre-onboard-doctor/add-pre-onboard-doctor.component";

@Component({
  selector: "app-pre-onboard-doctors",
  templateUrl: "./pre-onboard-doctors.component.html",
  styleUrls: ["./pre-onboard-doctors.component.scss"],
})
export class PreOnboardDoctorsComponent implements OnInit {
  activeTab: "ALL" | "UNCLAIMED" | "CLAIMED" = "UNCLAIMED";
  doctors: any[] = [];
  isLoading = false;
  totalDoctors = 0;
  unclaimedCount = 0;
  claimedCount = 0;
  page = 1;
  pageSize = 10;
  search = new FormControl("");
  baseUrl = environment.BASE_URL || "https://digiopd.com/";

  constructor(
    private apiService: ApiService,
    private dialog: MatDialog,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadDoctors();
    this.setupSearch();
  }

  private setupSearch(): void {
    this.search.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(() => {
        this.page = 1;
        this.loadDoctors();
      });
  }

  setTab(tab: "ALL" | "UNCLAIMED" | "CLAIMED"): void {
    if (this.activeTab === tab) return;
    this.activeTab = tab;
    this.page = 1;
    this.loadDoctors();
  }

  refresh(): void {
    this.loadDoctors();
  }

  loadDoctors(): void {
    this.isLoading = true;
    const params: any = {
      page: this.page,
      size: this.pageSize,
      status: this.activeTab,
      search: this.search.value || "",
    };

    this.apiService.GetData(URLConstant.adminPreOnboardedList, params).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        const data = res?.result?.data || res?.result || res?.data;
        this.doctors = data?.doctors || data?.list || [];
        this.totalDoctors = data?.total !== undefined ? data?.total : (data?.count !== undefined ? data?.count : this.doctors.length);
        if (data?.unclaimedCount !== undefined) {
          this.unclaimedCount = data.unclaimedCount;
        }
        if (data?.claimedCount !== undefined) {
          this.claimedCount = data.claimedCount;
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error("Error loading doctors", err);
        this.toastr.error("Failed to load pre-onboarded doctors.");
      },
    });
  }

  pageChanged(newPage: number): void {
    this.page = newPage;
    this.loadDoctors();
  }

  openAddDoctorDialog(): void {
    const dialogRef = this.dialog.open(AddPreOnboardDoctorComponent, {
      width: "780px",
      maxHeight: "92vh",
      panelClass: "pre-onboard-dialog-pane",
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((res: any) => {
      if (res?.refresh) {
        this.activeTab = "UNCLAIMED";
        this.page = 1;
        this.loadDoctors();
      }
    });
  }

  getDoctorPublicUrl(doc: any): string {
    const city = (doc?.city || "india").toLowerCase().replace(/\s+/g, "-");
    const slug = doc?.profileSlug || doc?.doctorId;
    return `${this.baseUrl}${city}/doctor/${slug}`;
  }

  getInitials(name: string): string {
    if (!name) return "DR";
    const clean = String(name).replace(/^dr\.?\s*/i, "").trim();
    return clean ? clean.slice(0, 2).toUpperCase() : "DR";
  }

  copyClaimLink(doc: any): void {
    const link = this.getDoctorPublicUrl(doc);
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(link).then(() => {
        this.toastr.success("Public profile link copied to clipboard!");
      });
    } else {
      this.toastr.info(link, "Profile Link");
    }
  }

  viewPublicProfile(doc: any): void {
    const url = this.getDoctorPublicUrl(doc);
    window.open(url, "_blank");
  }
}


import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ApiService } from "../../shared/api.service";
import { URLConstant } from "../../apisURL/url";
import { ComposeAnnouncementComponent } from "../compose-announcement/compose-announcement.component";

@Component({
  selector: "app-feature-announcements",
  templateUrl: "./feature-announcements.component.html",
  styleUrls: ["./feature-announcements.component.scss"],
})
export class FeatureAnnouncementsComponent implements OnInit {
  loading = false;
  announcements: any[] = [];
  page = 1;
  limit = 10;
  total = 0;
  totalPages = 0;

  constructor(
    private apiService: ApiService,
    private dialog: MatDialog,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.fetchAnnouncements();
  }

  fetchAnnouncements(): void {
    this.loading = true;
    this.apiService
      .GetData(URLConstant.announcementsList, {
        page: this.page.toString(),
        limit: this.limit.toString(),
      })
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          if (res?.success && res?.result) {
            this.announcements = res.result.announcements || [];
            this.total = res.result.pagination?.total || 0;
            this.totalPages = res.result.pagination?.totalPages || 0;
          }
        },
        error: (err: any) => {
          this.loading = false;
          this.snack.open(
            err?.message || "Failed to load announcements",
            "OK",
            { duration: 3000 }
          );
        },
      });
  }

  openCompose(): void {
    const dialogRef = this.dialog.open(ComposeAnnouncementComponent, {
      width: "100%",
      maxWidth: "640px",
      maxHeight: "100vh",
      height: "100%",
      disableClose: true,
      panelClass: "compose-dialog-panel",
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === "sent") {
        this.page = 1;
        this.fetchAnnouncements();
        this.snack.open("Announcement sent successfully!", "OK", {
          duration: 3000,
        });
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case "completed":
        return "badge--success";
      case "processing":
        return "badge--warning";
      case "failed":
        return "badge--error";
      case "queued":
        return "badge--info";
      default:
        return "";
    }
  }

  getChannelIcons(channels: string[]): string {
    return (channels || [])
      .map((c: string) => (c === "email" ? "📧" : "💬"))
      .join(" ");
  }

  getAudienceLabel(audience: string): string {
    switch (audience) {
      case "doctors":
        return "Doctors";
      case "patients":
        return "Patients";
      case "all":
        return "All Users";
      default:
        return audience;
    }
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
    this.fetchAnnouncements();
  }
}

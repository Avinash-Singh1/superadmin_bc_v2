import { Component, OnInit, HostListener } from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { URLConstant } from "src/app/apisURL/url";
import { ApiService } from "src/app/shared/api.service";

@Component({
  selector: "app-support-tickets-list",
  templateUrl: "./support-tickets-list.component.html",
  styleUrls: ["./support-tickets-list.component.scss"],
})
export class SupportTicketsListComponent implements OnInit {
  tickets: any[] = [];
  stats: any = {
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    rejected: 0,
    closed: 0,
  };

  loading: boolean = false;
  isUpdating: boolean = false;

  // Filters
  selectedStatus: string = "ALL";
  selectedCategory: string = "ALL";
  searchQuery: string = "";

  // Pagination
  page: number = 1;
  size: number = 10;
  totalCount: number = 0;

  // Selected Ticket for Modal / Drawer
  selectedTicket: any = null;
  modalStatus: string = "OPEN";
  modalAdminRemarks: string = "";
  modalEnableMedicalEdit: boolean = false;
  showModal: boolean = false;

  statusList = [
    { value: "ALL", label: "All Statuses" },
    { value: "OPEN", label: "Pending / Open" },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "RESOLVED", label: "Resolved" },
    { value: "REJECTED", label: "Rejected" },
    { value: "CLOSED", label: "Closed" },
  ];

  categories = [
    { value: "ALL", label: "All Categories" },
    { value: "MEDICAL_VERIFICATION_EDIT", label: "Medical Verification Edit" },
    { value: "PROFILE_UPDATE", label: "Profile Update" },
    { value: "ESTABLISHMENT_ISSUE", label: "Clinic / Establishment" },
    { value: "APPOINTMENT_ISSUE", label: "Appointment & Calendar" },
    { value: "PAYOUT_ISSUE", label: "Payout & Finance" },
    { value: "TECHNICAL_ISSUE", label: "Technical Issue" },
    { value: "GENERAL", label: "General Inquiry" },
  ];

  constructor(
    private apiService: ApiService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.getSupportTickets();
  }

  getSupportTickets(): void {
    this.loading = true;
    const params: any = {
      page: this.page,
      size: this.size,
    };

    if (this.selectedStatus && this.selectedStatus !== "ALL") {
      params.status = this.selectedStatus;
    }
    if (this.selectedCategory && this.selectedCategory !== "ALL") {
      params.category = this.selectedCategory;
    }
    if (this.searchQuery && this.searchQuery.trim()) {
      params.search = this.searchQuery.trim();
    }

    this.apiService.GetData(URLConstant.supportTicketsList, params).subscribe({
      next: (res: any) => {
        this.loading = false;
        const data = res?.data || res?.result || {};
        this.tickets = data.tickets || [];
        this.totalCount = data.count || 0;
        if (data.stats) {
          this.stats = data.stats;
        }
      },
      error: (err: any) => {
        this.loading = false;
        console.error("Error loading support tickets:", err);
        this.toastr.error("Failed to load support tickets.");
      },
    });
  }

  onFilterStatus(status: string): void {
    this.selectedStatus = status;
    this.page = 1;
    this.getSupportTickets();
  }

  onCategoryChange(): void {
    this.page = 1;
    this.getSupportTickets();
  }

  onSearch(): void {
    this.page = 1;
    this.getSupportTickets();
  }

  clearSearch(): void {
    this.searchQuery = "";
    this.page = 1;
    this.getSupportTickets();
  }

  pageChanged(newPage: number): void {
    this.page = newPage;
    this.getSupportTickets();
  }

  openTicketModal(ticket: any): void {
    this.selectedTicket = ticket;
    this.modalStatus = ticket.status || "OPEN";
    this.modalAdminRemarks = ticket.adminRemarks || "";
    // If ticket is for medical verification edit, default to true if setting to RESOLVED
    this.modalEnableMedicalEdit = ticket.category === "MEDICAL_VERIFICATION_EDIT";
    this.showModal = true;
  }

  @HostListener("document:keydown.escape")
  onEscapeKey(): void {
    if (this.showModal) {
      this.closeTicketModal();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeTicketModal();
    }
  }

  closeTicketModal(): void {
    this.showModal = false;
    this.selectedTicket = null;
  }

  saveTicketStatus(): void {
    if (!this.selectedTicket) return;

    this.isUpdating = true;
    const ticketId = this.selectedTicket._id || this.selectedTicket.ticketId;
    const url = URLConstant.supportTicketStatus + ticketId + "/status";

    const payload = {
      status: this.modalStatus,
      adminRemarks: this.modalAdminRemarks,
      enableMedicalVerificationEdit:
        this.selectedTicket.category === "MEDICAL_VERIFICATION_EDIT"
          ? this.modalEnableMedicalEdit
          : undefined,
    };

    this.apiService.patchData(url, payload, {}).subscribe({
      next: (res: any) => {
        this.isUpdating = false;
        this.toastr.success(`Ticket ${this.selectedTicket.ticketId} updated to ${this.modalStatus}.`);
        if (this.modalEnableMedicalEdit) {
          this.toastr.info("Medical Verification editing permission has been enabled for this doctor.");
        }
        this.closeTicketModal();
        this.getSupportTickets();
      },
      error: (err: any) => {
        this.isUpdating = false;
        console.error("Error updating ticket status:", err);
        this.toastr.error("Failed to update ticket status.");
      },
    });
  }

  /**
   * Quick action button on the table row to directly enable medical verification edit and resolve ticket
   */
  quickResolveAndEnableEdit(ticket: any, event: Event): void {
    event.stopPropagation();
    if (!confirm(`Enable Medical Verification edit for ${ticket.doctorName || "this doctor"} and mark ticket as RESOLVED?`)) {
      return;
    }

    const ticketId = ticket._id || ticket.ticketId;
    const url = URLConstant.supportTicketStatus + ticketId + "/status";

    const payload = {
      status: "RESOLVED",
      adminRemarks: "Medical verification editing has been enabled by admin.",
      enableMedicalVerificationEdit: true,
    };

    this.apiService.patchData(url, payload, {}).subscribe({
      next: (res: any) => {
        this.toastr.success(`Ticket resolved & Medical Verification edit enabled for ${ticket.doctorName || "Doctor"}.`);
        this.getSupportTickets();
      },
      error: (err: any) => {
        console.error("Error resolving ticket:", err);
        this.toastr.error("Failed to resolve ticket.");
      },
    });
  }

  getCategoryLabel(categoryKey: string): string {
    const found = this.categories.find((c) => c.value === categoryKey);
    return found ? found.label : categoryKey || "General";
  }

  getStatusClass(status: string): string {
    switch (status) {
      case "OPEN":
        return "badge-status badge-open";
      case "IN_PROGRESS":
        return "badge-status badge-progress";
      case "RESOLVED":
        return "badge-status badge-resolved";
      case "REJECTED":
        return "badge-status badge-rejected";
      case "CLOSED":
        return "badge-status badge-closed";
      default:
        return "badge-status";
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case "URGENT":
        return "badge-priority priority-urgent";
      case "HIGH":
        return "badge-priority priority-high";
      case "MEDIUM":
        return "badge-priority priority-medium";
      case "LOW":
        return "badge-priority priority-low";
      default:
        return "badge-priority";
    }
  }
}

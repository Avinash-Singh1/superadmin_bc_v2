import { Component, OnDestroy, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { SettingsAddModalComponent } from "../settings-add-modal/settings-add-modal.component";
import { EventService } from "src/app/services/event.service";
import { Subscription } from "rxjs";
import { ApiService } from "src/app/shared/api.service";
import { URLConstant } from "src/app/apisURL/url";
import { APP_CONSTANTS } from "src/app/constant/app.constant";
import { LocalStorageService } from "src/app/services/storage.service";

@Component({
  selector: "nectar-hospital-faqs-list",
  templateUrl: "./hospital-faqs-list.component.html",
  styleUrls: ["./hospital-faqs-list.component.scss"],
})
export class HospitalFaqsListComponent implements OnInit, OnDestroy {
  constructor(
    private apiService: ApiService,
    private matdialog: MatDialog,
    private eventService: EventService,
    private localStorage: LocalStorageService
  ) {}

  ngOnInit(): void {
    this.getFaqsList();
    this.getEvents();
  }

  userId?: string = this.localStorage.getItem("userId");

  faqsList: any[] = [];
  deleteSubscription$!: Subscription;
  selectedId!: string;

  getFaqsList() {
    this.apiService
      .GetData(URLConstant.listFaqsHospital, {
        userType: APP_CONSTANTS.USER_TYPES.HOSPITAL,
        userId: this.userId,
      })
      .subscribe({
        next: (res: any) => {
          this.faqsList = res.result;
        },
        error: () => {
          this.faqsList = [];
        },
      });
  }
  onAddFaqs() {
    const addDialog = this.matdialog.open(SettingsAddModalComponent, {
      width: "720px",
      data: {
        type: 2,
        heading: "Add FAQs",
        apiEndpoints: URLConstant.addFaqs,
        edit: false,
      },
      autoFocus: false,
    });
    addDialog.afterClosed().subscribe((res: boolean) => {
      if (res) {
        this.getFaqsList();
      }
    });
  }

  onEditFaqs(faq: any) {
    this.selectedId = faq._id;
    const editModal = this.matdialog.open(SettingsAddModalComponent, {
      width: "720px",
      data: {
        type: 2,
        edit: true,
        patchValue: faq,
        heading: "Edit FAQs",
        apiEndpoints: URLConstant.editFaq,
        editKey: "faqId",
      },
    });
    editModal.afterClosed().subscribe((res: boolean) => {
      if (res) {
        this.getFaqsList();
      }
    });
  }
  getEvents() {
    this.deleteSubscription$ = this.eventService
      .getEvent("entryDeleted")
      .subscribe((res: boolean) => {
        if (res) {
          this.apiService
            .DeleteData(URLConstant.deleteFaq, {
              faqId: this.selectedId,
            })
            .subscribe({
              next: (res: any) => {
                this.selectedId = "";

                this.getFaqsList();
              },
            });
        }
      });
  }
  ngOnDestroy(): void {
    this.deleteSubscription$?.unsubscribe();
  }
}

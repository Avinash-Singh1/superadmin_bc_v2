import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { AddMoreEditModalComponent } from "../../components/add-more-edit-modal/add-more-edit-modal.component";
import { ActivatedRoute } from "@angular/router";
import { LocalStorageService } from "src/app/services/storage.service";
import { DeleteModalComponent } from "src/app/shared/components/delete-modal/delete-modal.component";
import { ApiService } from "src/app/shared/api.service";
import { URLConstant } from "src/app/apisURL/url";
import { APP_CONSTANTS } from "src/app/constant/app.constant";

@Component({
  selector: "nectar-doctor-education",
  templateUrl: "./doctor-education.component.html",
  styleUrls: ["./doctor-education.component.scss"],
})
export class DoctorEducationComponent implements OnInit {
  data: any;
  edit: boolean = false;

  constructor(
    private matdialog: MatDialog,
    private activateRoute: ActivatedRoute,
    private apiService: ApiService,
    private localStorage: LocalStorageService
  ) {
    this.data =
      this.profileListing[this.activateRoute.snapshot.data["heading"]];
  }

  userId?: string = this.localStorage.getItem("userId");

  educationList: any;
  awardsList: any;
  medicalRegistration: any;
  membershipList: any;
  servicesList: any;
  faqsList: any;
  videoList: any;
  procedureList: any;
  socialmediaList: any;
  profileListing: any = {
    1: { label: "Education", type: 1, listName: "educationList" },
    2: { label: "Awards and Recognitions", type: 2, listName: "awardsList" },
    3: {
      label: "Medical Registrations",
      type: 3,
      listName: "medicalRegistration",
    },
    4: { label: "Membership", type: 4, listName: "membershipList" },
    5: { label: "Services", type: 5, listName: "servicesList" },
    6: { label: "FAQs", type: 6, listName: "faqsList" },
    7: { label: "Videos", type: 7, listName: "videoList" },
    8: { label: "Social", type: 8, listName: "socialmediaList" },
    9: { label: "Procedure", type: 9, listName: "procedureList" },
  };
  ngOnInit(): void {
    switch (this.data.type) {
      case 6:
        this.faqListDetail();
        break;
      case 7:
        this.getVideosList();
        break;
      case 9:
        this.getProcedureList();
        break;
      default:
        this.getListing();
    }
  }

  onOpenDialog(edit: boolean, item: any) {
    const addEditDialog = this.matdialog.open(AddMoreEditModalComponent, {
      width: "720px",
      autoFocus: false,
      minHeight: "500px",
      data: {
        edit,
        content: {
          heading: `${edit ? "Edit" : "Add"} ${this.data.label}`,
          type: this.data.type,
          patchData: item,
        },
        userId: this.userId,
      },
    });
    addEditDialog.afterClosed().subscribe((res: any) => {
      if (res) {
        switch (this.data.type) {
          case 6:
            this.faqListDetail();
            break;
          case 7:
            this.getVideosList();
            break;
          case 9:
            this.getProcedureList();
            break;
          default:
            this.getListing();
        }
      }
    });
  }
  onDeleteModal(item: any, str: any = "Service") {
    const deleteDialog = this.matdialog.open(DeleteModalComponent, {
      data: {
        heading: "Delete from Doctor profile?",
        message: `This will delete ${item.name} from ${str} sections of your profile.`,
        id: item?.procedureId ? item?.procedureId : item?._id,
        type: str == "Service" ? 5 : 9,
        userId: this.userId,
      },
      width: "720px",
    });
    deleteDialog.afterClosed().subscribe((data: any) => {
      if (data) {
        if (str == "Service") {
          this.getListing();
        } else {
          this.getProcedureList();
        }
      }
    });
  }
  faqListDetail() {
    let faq = {
      userType: APP_CONSTANTS.USER_TYPES.DOCTOR,
      userId: this.userId,
    };
    this.apiService
      .GetData(URLConstant.faqListDoctor, faq)
      .subscribe((res: any) => {
        this.faqsList = res?.result;
      });
  }

  getVideosList() {
    let payload = {
      userId: this.userId,
      userType: APP_CONSTANTS.USER_TYPES.DOCTOR,
    };
    this.apiService
      .GetData(URLConstant.doctorVideos, payload)
      .subscribe((res: any) => {
        this.videoList = res?.result?.data;
        this.videoList.forEach((element: any) => {
          element.url = element?.url.replace("watch?v=", "embed/");
        });
      });
  }

  getProcedureList() {
    this.apiService
      .GetData(URLConstant.procedures, { userId: this.userId })
      .subscribe((res: any) => {
        this.procedureList = res?.result?.list;
      });
  }

  getListing() {
    this.apiService
      .GetData(URLConstant.settingList, {
        type: this.data.type,
        userId: this.userId,
      })
      .subscribe((res: any) => {
        const listName = this.data.listName as keyof DoctorEducationComponent;
        this[listName] = res?.result?.list;
      });
  }
}

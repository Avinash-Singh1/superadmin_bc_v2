import { DatePipe, KeyValuePipe, TitleCasePipe } from "@angular/common";
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from "@angular/core";
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatMenuTrigger } from "@angular/material/menu";
import { MatTableDataSource } from "@angular/material/table";
import { debounceTime } from "rxjs";
import { URLConstant } from "src/app/apisURL/url";
import { ApiService } from "src/app/shared/api.service";
import { CommentModalComponent } from "../comment-modal/comment-modal.component";
import { DateModalComponent } from "../date-modal/date-modal.component";
import { ToastrService } from "ngx-toastr";
import { ngxCsv } from "ngx-csv/ngx-csv";
import { ReadMoreComponent } from "src/app/dialogs/read-more/read-more.component";

@Component({
  selector: "app-surger-lead-list",
  templateUrl: "./surger-lead-list.component.html",
  styleUrls: ["./surger-lead-list.component.scss"],
  providers: [TitleCasePipe],
})
export class SurgerLeadListComponent implements OnInit {
  constructor(
    private fb: UntypedFormBuilder,
    private apiService: ApiService,
    private matdialog: MatDialog,
    private toastr: ToastrService,
    private titleCase: TitleCasePipe,
    private datePipe: DatePipe
  ) { }
  filterForm!: UntypedFormGroup;
  serviceList: any = [];
  statusList: { [key: number]: string } = {

    1: "Pending",
    2: "Not interested",
    3: "No response",
    4: "Wrong number",
    5: "Call back later",
    6: "Appointment fixed",
    7: "Completed",
  };
  sourceList: any = [
    { name: "Website", id: "website" },
    { name: "Facebook", id: "facebook" },
  ];
  claimedUserType: { [key: number]: string } = {
    1: "Admin",
  };
  displayedColumns: string[] = [
    "leadId",
    "timeDate",
    "source",
    "name",
    "phone",
    "surgeryMasterName",
    "city",
    "claimByUserType",
    "claimedDate",
    "status",
    "followUpDate",
    "comments",
  ];
  filterTable: boolean = false;
  service!: boolean[];
  status!: boolean[];
  source!: boolean[];
  dataSource: MatTableDataSource<[]> = new MatTableDataSource();
  totalItems: number = 0;

  ngOnInit(): void {
    this.validateForm();
    this.getListing();
    this.addCheckboxesToForm("status");
    this.addCheckboxesToForm("source");
    this.getSurgeryLeadList();
    this.onSearch();
  }
  validateForm() {
    this.filterForm = this.fb.group({
      typeOfList: [1],
      search: [""],
      service: this.fb.array([]),
      status: this.fb.array([]),
      source: this.fb.array([]),
      page: [1],
      size: [10],
      sort: [],
      sortOrder: [],
    });
  }
  get control() {
    return this.filterForm.controls;
  }
  get serviceFormArray() {
    return this.filterForm.controls["service"] as UntypedFormArray;
  }
  get statusFormArray() {
    return this.filterForm.controls["status"] as UntypedFormArray;
  }
  get sourceFormArray() {
    return this.filterForm.controls["source"] as UntypedFormArray;
  }

  onChangeList(typeOfList: number) {
    this.filterForm.patchValue(
      {
        typeOfList,
        page: 1,
        search: "",
        service: this.serviceFormArray.value.map((item: any) => {
          return false;
        }),
        status: this.statusFormArray.value.map((item: any) => {
          return false;
        }),
        source: this.sourceFormArray.value.map((item: any) => {
          return false;
        }),
        sort: "",
        sortOrder: "",
      },
      { emitEvent: false }
    );
    this.getSurgeryLeadList();
  }
  onPageChange(page: number) {
    this.filterForm.patchValue({ page }, { emitEvent: false });
    this.getSurgeryLeadList();
  }
  onSearch() {
    this.control["search"].valueChanges
      .pipe(debounceTime(300))
      .subscribe((res: any) => {
        console.log(res);

        this.getSurgeryLeadList();
      });
  }
  onSorting(columnName: string) {
    console.log("sorting");
    const { sort, sortOrder } = this.filterForm.value;
    sortOrder == "DESC"
      ? this.filterForm.patchValue({
        sort: "",
        sortOrder: "",
      })
      : this.filterForm.patchValue(
        {
          sort: columnName,
          sortOrder:
            sort == columnName
              ? sortOrder && sortOrder == "ASC"
                ? "DESC"
                : "ASC"
              : "ASC",
        },
        { emitEvent: false }
      );
    this.getSurgeryLeadList();
    console.log(this.filterForm.value);
  }
  onFilterMenuOpen() {
    const { service, source, status } = this.filterForm.value;
    this.service = service;
    this.status = status;
    this.source = source;
    this.filterTable = false;
    console.log(this.filterForm.value);
  }
  onFilterMenuClosed() {
    !this.filterTable
      ? this.filterForm.patchValue(
        {
          service: this.service,
          status: this.status,
          source: this.source,
        },
        { emitEvent: false }
      )
      : null;
  }
  onFilter() {
    this.filterTable = true;
    this.getSurgeryLeadList();
  }
  onClearFilter() {
    this.filterTable = true;
    this.filterForm.patchValue(
      {
        service: this.serviceFormArray.value.map((item: any) => {
          return false;
        }),
        status: this.statusFormArray.value.map((item: any) => {
          return false;
        }),
        source: this.sourceFormArray.value.map((item: any) => {
          return false;
        }),
      },
      { emitEvent: false }
    );
    console.log(this.filterForm.value);
    this.getSurgeryLeadList();
  }
  getListing() {
    this.apiService.GetData(URLConstant.masterSurgerylist, {}).subscribe({
      next: (res: any) => {
        console.log(res);
        const { count, data } = res.result;
        count
          ? ((this.serviceList = data), this.addCheckboxesToForm("service"))
          : (this.serviceList = []);
      },
      error: (error: any) => {
        console.log(error);
      },
    });
  }
  addCheckboxesToForm(listName: string) {
    switch (listName) {
      case "service":
        console.log(this.serviceList);

        this.serviceList.forEach(() =>
          this.serviceFormArray.push(new UntypedFormControl(false))
        );
        break;
      case "status":
        Object.keys(this.statusList).forEach(() => {
          this.statusFormArray.push(new UntypedFormControl(false));
        });
        break;
      case "source":
        this.sourceList.forEach(() => {
          this.sourceFormArray.push(new UntypedFormControl(false));
        });
        break;
    }
  }
  todayCount:any;
  upcomingCount:any
  getSurgeryLeadList() {
    const payload = this.generatePayload();
    this.apiService
      .Postdata(URLConstant.surgeryLeadList, payload, {})
      .subscribe({
        next: (res: any) => {
          this.todayCount=res?.result?.todayCount
          this.upcomingCount=res?.result?.upcomingCount
          console.log(res);
          const { count, data } = res.result?.enquiryList;
          count? ((this.totalItems = count), (this.dataSource.data = data)): ((this.totalItems = 0), (this.dataSource.data = []));
        },
      });
  }
  onChangeStatus(status: any, id: string, index: number) {
    this.apiService
      .PutData(`${URLConstant.surgeryLeadChange}/${id}`, { status }, {})
      .subscribe({
        next: (res: any) => {
          this.getSurgeryLeadList();
        },
      });
  }
  onAddComment(id: string, comments: string) {
    const commentDialog = this.matdialog.open(CommentModalComponent, {
      panelClass: "comment-modal-container",
      autoFocus: false,
      width: "720px",
      minHeight: "40vh",
      data: {
        id,
        comments,
      },
    });
    commentDialog.afterClosed().subscribe((res: any) => {
      if (res) {
        this.getSurgeryLeadList();
      }
    });
  }
  onSelectDate(id: string, followUpDate: any) {
    const calendarDialog = this.matdialog.open(DateModalComponent, {
      width: "360px",
      height: "420px",
      autoFocus: false,
      panelClass: "date-modal-container",
      data: {
        id,
        followUpDate,
      },
    });
    calendarDialog.afterClosed().subscribe((res: any) => {
      if (res) {
        this.getSurgeryLeadList();
      }
    });
  }
  onSetFollowUpDate(day: number, id: string) {
    const followUpDate = new Date(
      new Date().setDate(new Date().getDate() + day)
    ).toISOString();
    this.apiService
      .PutData(`${URLConstant.surgeryLeadChange}/${id}`, { followUpDate }, {})
      .subscribe({
        next: (res: any) => {
          console.log(res);
          this.getSurgeryLeadList();
        },
      });
  }
  onCSVExport() {
    if (!this.totalItems) {
      this.toastr.error("No surgery lead found");
      return;
    }
    const payload = this.generatePayload();
    delete payload?.page;
    this.apiService
      .Postdata(URLConstant.surgeryLeadList, payload, {})
      .subscribe({
        next: (res: any) => {
          const { count, data } = res.result;
          if (count) {
            const downloadData = data.map((item: any) => {
              return {
                leadId: item.leadId ?? "N/A",
                timeDate:
                  this.datePipe.transform(
                    item.createdAt,
                    "dd/MM/yyyy, hh:mm:ss"
                  ) ?? "N/A",
                source: item.source ?? "N/A",
                name: item.name ?? "N/A",
                phone: item.phone ?? "N/A",
                surgeryMasterName: item.surgeryMasterName ?? "N/A",
                city: item.city ?? "N/A",
                claimByUserType: item.claimByUserType ?? "N/A",
                claimedDate:
                  this.datePipe.transform(
                    item.createdAt,
                    "dd/MM/yyyy, hh:mm:ss"
                  ) ?? "N/A",
                status: item.source ?? "N/A",
                followUpDate:
                  this.datePipe.transform(
                    item.createdAt,
                    "dd/MM/yyyy, hh:mm:ss"
                  ) ?? "N/A",
                comments: item.comments,
              };
            });
            this.downloadCSV(downloadData);
          }
        },
      });
  }
  downloadCSV(data: any) {
    const options = {
      headers: this.displayedColumns.map((column: string) =>
        this.titleCase.transform(column)
      ),
    };
    new ngxCsv(data, "Surgery lead list", options);
  }
  generatePayload(isExport: boolean = false) {
    const { service, status, source } = this.filterForm.value;
    let payload = {
      ...this.filterForm.value,
      service: service
        .map((service: boolean, i: number) =>
          service ? this.serviceList[i]._id : null
        )
        .filter((service: any) => service != null),
      status: status
        .map((status: boolean, i: number) => (status ? i + 1 : null))
        .filter((status: any) => status != null),
      source: source
        .map((source: boolean, i: number) =>
          source ? this.sourceList[i].id : null
        )
        .filter((source: any) => source != null),
    };
    for (let key in payload) {
      !payload[key] ||
        (typeof payload[key] == "object" && !payload[key]?.length)
        ? delete payload[key]
        : null;
    }
    return isExport ? (payload = { ...payload, isExport }) : payload;
  }
  onClaimed(claimByUserType: string, id: string) {
    this.apiService
      .PutData(
        `${URLConstant.surgeryLeadChange}/${id}`,
        {
          claimByUserType,
          claimedDate: new Date().toISOString(),
        },
        {}
      )
      .subscribe({
        next: (res: any) => {
          console.log(res);
          this.getSurgeryLeadList();
        },
        error: (error: any) => {
          console.log(error);
        },
      });
  }
  readMore(data:any){
    const commentDialog = this.matdialog.open(ReadMoreComponent, {
      panelClass: "comment-modal-container",
      autoFocus: false,
      width: "720px",
      height: "500px",
      data: {
       data:data 
      },
    });
  }
}

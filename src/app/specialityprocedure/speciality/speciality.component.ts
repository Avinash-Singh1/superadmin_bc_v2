import { Component, OnInit } from "@angular/core";
import { UntypedFormControl } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { ToastrService } from "ngx-toastr";
import { debounceTime, distinctUntilChanged } from "rxjs";
import { URLConstant } from "src/app/apisURL/url";
import { AddeditSpecialityComponent } from "src/app/dialogs/addedit-speciality/addedit-speciality.component";
import { DeleteProcedureComponent } from "src/app/dialogs/delete-procedure/delete-procedure.component";
import { ApiService } from "src/app/shared/api.service";

@Component({
  selector: "app-speciality",
  templateUrl: "./speciality.component.html",
  styleUrls: ["./speciality.component.scss"],
})
export class SpecialityComponent implements OnInit {
  displayedColumns: string[] = ["Name", "Action"];
  dataSource: any;
  dataSourceProcedure: any;
  toastrMessage: any;
  toastrCreation: any;
  aseImage: boolean = true;
  descImage: boolean = false;
  nosortImage: boolean = false;
  aseProcedure: boolean = true;
  descProcedure: boolean = false;
  noProcedure: boolean = false;
  sortByProcedure: any = {};
  constructor(
    private apiservice: ApiService,
    private dialog: MatDialog,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.getSpecializationList();
    this.getProcedureList();
    this.search.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((val) => this.searchFunction(val));
  }
  doctorsList: boolean = true;
  hospitalsList: boolean = false;
  search = new UntypedFormControl();
  // sortBy: any = {
  //   order:"",
  //   sortBy:""
  // };
  chnageDoctorList(list: any) {
    this.sortBy = {
      order: "",
      sortBy: "",
    };
    if (list == "doctors") {
      this.doctorsList = true;
      this.hospitalsList = false;
      this.search.reset();
    } else if (list == "hospitals") {
      this.hospitalsList = true;
      this.doctorsList = false;
      this.search.reset();
      this.getProcedureList();
    }
  }
  totalLength: any;
  totalLengthProcedure: any;
  getSpecializationList(username?: any) {
    let data: any = {
      search: this.search.value,
    };

    let param = { ...data, ...this.sortBy };

    Object.keys(param).forEach((key) => {
      if (
        param[key] === null ||
        param[key] === undefined ||
        param[key] === ""
      ) {
        delete param[key];
      }
    });
    this.apiservice
      .GetData(URLConstant.specialization, param)
      .subscribe((res: any) => {
        this.dataSource = res?.result?.data;
        this.totalLength = res?.result?.count;
      });
  }
  getProcedureList() {
    let data: any = {
      search: this.search.value,
    };
    let param = { ...data, ...this.sortByProcedure };

    Object.keys(param).forEach((key) => {
      if (
        param[key] === null ||
        param[key] === undefined ||
        param[key] === ""
      ) {
        delete param[key];
      }
    });
    this.apiservice
      .GetData(URLConstant.procedure, param)
      .subscribe((res: any) => {
        this.dataSourceProcedure = res?.result?.data;
        this.totalLengthProcedure = res?.result?.count;
      });
  }
  searchFunction(value: any) {
    if (this.doctorsList == true) {
      this.getSpecializationList();
    } else if (this.hospitalsList == true) {
      this.getProcedureList();
    }
  }

  deleteData(id: any, type: any) {
    const dialogRef = this.dialog.open(DeleteProcedureComponent, {
      maxHeight: "100vh",
      width: "720px",
      panelClass: "view-popup",
      data: {
        type: type,
      },
    });
    dialogRef.afterClosed().subscribe((res: any) => {
      let param = {
        type: type == "Speciality" ? 10 : 4,
      };
      if (res?.type) {
        this.apiservice
          .DeleteData(URLConstant.master + "/" + id, param)
          .subscribe((res: any) => {
            type == "Speciality"
              ? this.getSpecializationList()
              : this.getProcedureList();
          });
      }
    });
  }

  addEditSpeciaityProcedure(
    type: any,
    creation: any,
    id?: any,
    content?: any,
    imageUrl?: any,
    description?: any,
    links?: any,
    breadcrumb?:any,
    sections?:any
  ) {
    let dialogRef = this.dialog.open(AddeditSpecialityComponent, {
      maxHeight: "100vh",
      width: "720px",
      panelClass: "view-popup",
      data: {
        type: type,
        creation: creation,
        id: creation == "Edit" ? id : "",
        content: creation == "Edit" ? content : "",
        image: creation == "Edit" ? imageUrl : "",
        description: creation == "Edit" ? description : "",
        links: creation == "Edit" ? links : "",
        breadcrumb: creation == "Edit" ? breadcrumb : "",
        sections: creation == "Edit" ? sections : []
      },
    });
    dialogRef.afterClosed().subscribe((res: any) => {
      if (res?.name && res?.creation == "Add") {
        let body: any = {
          type: res?.type == "Speciality" ? 10 : 4,
          content: {
            name: res?.name,
            image: res?.imageURL,
            description: res?.description,
            links: res?.links,
            sections: res?.sections || []
          },
        };
        Object.keys(body?.content).forEach((key) => {
          if (!body?.content[key]) {
            delete body?.content[key];
          }
        });
        this.toastrMessage = res?.type;
        this.toastrCreation = res?.creation;
        console.log(res?.creation);
        this.apiservice
          .Postdata(URLConstant.master, body, "")
          .subscribe((res: any) => {
            if (res?.success == true) {
              this.getSpecializationList();
              this.getProcedureList();
              this.toastr.success(
                this.toastrMessage +
                  " " +
                  "has been" +
                  " " +
                  this.toastrCreation +
                  "ed"
              );
            }
          });
      } else if (res?.name && res?.creation == "Edit") {
        let body = {
          name: res?.name,
          image: res?.imageURL,
          description: res?.description,
          links: res?.links,
          sections: res?.sections || [] 
        };
        let param = {
          type: res?.type == "Speciality" ? 10 : 4,
        };
        this.toastrMessage = res?.type;
        this.toastrCreation = res?.creation;
        console.log(res?.creation);
        this.apiservice
          .PutData(URLConstant.master + "/" + res?.id, body, param)
          .subscribe((res: any) => {
            if (res?.success == true) {
              this.getSpecializationList();
              this.getProcedureList();
              this.toastr.success(
                this.toastrMessage +
                  " " +
                  "has been" +
                  " " +
                  this.toastrCreation +
                  "ed"
              );
            }
          });
      }
    });
  }

  sortBy: any = {};

  sortData(sortkey?: any, sortOrder?: any, tablename?: any) {
    switch (true) {
      case sortkey == "fullName":
        this.sortBy =
          sortOrder == "ASC"
            ? { sort: "name", sortOrder: "ASC" }
            : sortOrder == "DESC"
            ? { sort: "name", sortOrder: "DESC" }
            : sortOrder == "nosort"
            ? { sort: "", sortOrder: "" }
            : {};
        this.aseImage =
          sortOrder == "ASC" || sortOrder == "DESC" ? false : true;
        this.descImage =
          sortOrder == "DESC" || sortOrder == "nosort" ? false : true;
        this.nosortImage =
          sortOrder == "nosort" || sortOrder == "ASC" ? false : true;
        console.log(this.aseImage, this.descImage, this.nosortImage);
        this.getSpecializationList();
        break;
      case sortkey == "fullNameProcedure":
        this.sortByProcedure =
          sortOrder == "ASC"
            ? { sort: "name", sortOrder: "ASC" }
            : sortOrder == "DESC"
            ? { sort: "name", sortOrder: "DESC" }
            : sortOrder == "nosort"
            ? { sort: "", sortOrder: "" }
            : {};
        this.aseProcedure =
          sortOrder == "ASC" || sortOrder == "DESC" ? false : true;
        this.descProcedure =
          sortOrder == "DESC" || sortOrder == "nosort" ? false : true;
        this.noProcedure =
          sortOrder == "nosort" || sortOrder == "ASC" ? false : true;
        this.getProcedureList();
        break;
    }
  }
}

import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { URLConstant } from "src/app/apisURL/url";
import { ApiService } from "src/app/shared/api.service";
import { DeleteModalComponent } from "../delete-modal/delete-modal.component";
import { EditSurgeryModalComponent } from "../edit-surgery-modal/edit-surgery-modal.component";

@Component({
  selector: "app-surgery-list",
  templateUrl: "./surgery-list.component.html",
  styleUrls: ["./surgery-list.component.scss"],
})
export class SurgeryListComponent implements OnInit {
  constructor(private apiService: ApiService, private matdialog: MatDialog) {}
  surgeryList: any = [];
  filteredList: any = [];
  searchQuery = '';
  viewMode: 'grid' | 'list' = 'grid';

  ngOnInit(): void {
    this.getSurgeryList();
  }

  getSurgeryList() {
    this.apiService.GetData(URLConstant.masterSurgerylist, {}).subscribe({
      next: (res: any) => {
        const { count, data } = res.result;
        this.surgeryList = count ? data : [];
        this.onSearch();
      },
    });
  }

  onSearch() {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) {
      this.filteredList = [...this.surgeryList];
    } else {
      this.filteredList = this.surgeryList.filter(
        (s: any) =>
          (s.title && s.title.toLowerCase().includes(q)) ||
          (s.slug && s.slug.toLowerCase().includes(q))
      );
    }
  }
  onDelete(surgeryId: string) {
    const deleteDialog = this.matdialog.open(DeleteModalComponent, {
      width: "720px",
      panelClass: "delete-modal",
      data: {
        heading:
          "The Surgery will be removed permanently. Do you want to delete?",
      },
    });
    deleteDialog.afterClosed().subscribe((res: boolean) => {
      if (res) {
        this.apiService
          .DeleteData(`${URLConstant.addSurgery}/${surgeryId}`, {})
          .subscribe({
            next: (res: any) => {
              this.getSurgeryList();
            },
            error: (error: any) => {
              console.log(error);
            },
          });
      }
    });
  }
  onEdit(surgery: any) {
    const editDialog = this.matdialog.open(EditSurgeryModalComponent, {
      width: "80vw",
      height: "90vh",
      maxHeight: "90vh",
      panelClass: "edit-surgery-panel",
      data: {
        patchData: surgery,
      },
    });
    editDialog.afterClosed().subscribe((res: boolean) => {
      if (res) {
        this.getSurgeryList();
      }
    });
  }
}

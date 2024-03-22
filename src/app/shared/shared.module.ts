import { NgModule } from "@angular/core";
import { DeleteModalComponent } from "./delete-modal/delete-modal.component";
import { NgSelectModule } from "@ng-select/ng-select";
import { NameInitialPipe } from "./pipes/name-initial.pipe";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";

const component = [DeleteModalComponent, NameInitialPipe];

@NgModule({
  declarations: [component],
  imports: [NgSelectModule, CommonModule, FormsModule],
  exports: [component],
})
export class SharedModule {}

import { Component, ContentChild } from "@angular/core";
import { ErrorDirective } from "../../directives/error.directive";

@Component({
  selector: "nectar-form-field",
  templateUrl: "./form-field.component.html",
})
export class FormFieldComponent {
  constructor() {}

  @ContentChild(ErrorDirective, { static: true })
  errorDirective!: ErrorDirective;
}

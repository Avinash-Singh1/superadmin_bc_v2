import { Injectable } from "@angular/core";
import { AbstractControlOptions, FormBuilder } from "@angular/forms";
import { FormValidationService } from "./form-validation.service";

@Injectable({
  providedIn: "root",
})
export class CreateFormService {
  constructor(
    private fb: FormBuilder,
    private formValidation: FormValidationService
  ) {}
  createDay() {
    return this.fb.array(
      [
        this.fb.group(
          {
            slot: ["morning"],
            from: [null],
            to: [null],
          },
          {
            validator: [this.formValidation.fromToValidation("from", "to")],
          } as AbstractControlOptions
        ),
        this.fb.group(
          {
            slot: ["afternoon"],
            from: [null],
            to: [null],
          },
          {
            validator: [this.formValidation.fromToValidation("from", "to")],
          } as AbstractControlOptions
        ),
        this.fb.group(
          {
            slot: ["evening"],
            from: [null],
            to: [null],
          },
          {
            validator: [this.formValidation.fromToValidation("from", "to")],
          } as AbstractControlOptions
        ),
      ],
      [this.formValidation.atleastOne()]
    );
  }
}

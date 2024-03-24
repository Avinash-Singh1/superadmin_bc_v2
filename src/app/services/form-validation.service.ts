import { Injectable } from "@angular/core";
import { AbstractControl, FormGroup, ValidatorFn } from "@angular/forms";

@Injectable({
  providedIn: "root",
})
export class FormValidationService {
  atleastOneDay(...args: any[]) {
    return (formGroup: FormGroup) => {
      let flag = false;
      args.forEach((day) => {
        if (formGroup.controls[day].status != "DISABLED") flag = true;
      });
      return !flag ? { atleastOneDay: true } : null;
    };
  }

  atleastOne(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      if (control instanceof FormGroup) {
        let flag = false;

        Object.keys(control.controls).forEach((key) => {
          const formControl = control.controls[key];

          if (formControl.value.from && formControl.value.to) {
            flag = true;
          }
        });

        return !flag ? { atleastOnetiming: true } : null;
      }

      return null;
    };
  }

  fromToValidation(from: string, to: string) {
    return (formGroup: FormGroup) => {
      const fromControl = formGroup.controls[from];
      const toControl = formGroup.controls[to];
      if (fromControl.value && !toControl.value) {
        toControl.setErrors({ mustHaveValue: true });
        return;
      } else if (!fromControl.value && toControl.value) {
        fromControl.setErrors({ mustHaveValue: true });
        return;
      }
      toControl.setErrors(null);
      fromControl.setErrors(null);
    };
  }
}

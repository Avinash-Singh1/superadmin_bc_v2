import { Injectable, Pipe, PipeTransform } from "@angular/core";
import { of } from "rxjs";

@Pipe({
  name: "formatarray",
})
@Injectable({
  providedIn: "root",
})
export class FormatarrayPipe implements PipeTransform {
  transform(value: any[], field: string): string {
    if (!value || (value && !value.length)) return "";

    return value.map((item: any) => item[field]).join(", ");
  }
}

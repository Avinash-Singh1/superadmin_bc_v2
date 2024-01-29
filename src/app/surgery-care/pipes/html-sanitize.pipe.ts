import { Pipe, PipeTransform } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";

@Pipe({
  name: "htmlSanitize",
})
export class HtmlSanitizePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  transform(value: any): any {
    return value ? this.sanitizer.bypassSecurityTrustHtml(value) : value;
  }
}

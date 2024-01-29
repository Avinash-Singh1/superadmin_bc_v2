import { Directive, ElementRef, Output, EventEmitter, HostListener, OnInit, Input } from "@angular/core";
import { fromEvent } from "rxjs";
import { take } from "rxjs/operators";

@Directive({
  selector: "[clickOutside]"
})
export class ClickoutsideDirective implements OnInit {
  @Output() clickOutside = new EventEmitter();

  @Input() exclusionSelector: string = ""; // Selector for the exclusion div
  captured = false;

  constructor(private elRef: ElementRef) {}

  ngOnInit() {
    // Use "mousedown" instead of "click" for capturing the first event
    fromEvent(document, "mousedown", { capture: true })
      .pipe(take(1))
      .subscribe(() => (this.captured = true));
  }

  @HostListener("document:click", ["$event"])
  onClick(event: MouseEvent) {
    if (!this.captured) {
      return;
    }

    // Check if the clicked element is the exclusion div or a cdk-panel-overlay
    const exclusionDiv = document.querySelector(this.exclusionSelector);
    console.log((event.target as HTMLElement).classList);
    const classList = (event.target as HTMLElement).classList ;
    let abc:boolean = false;
    for(let i = 0; i< classList.length ; i++) {
      if(classList[i].split("-").includes("calendar")){
        abc = true;
        break;
      }
    }
    console.log(abc)
    const isCdkPanelOverlay = (event.target as HTMLElement).classList;

    if (exclusionDiv && exclusionDiv.contains(event.target as Node) || abc) {
      return;
    }

    // Check if the clicked element is inside the host element
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.clickOutside.emit();
    }
  }
}

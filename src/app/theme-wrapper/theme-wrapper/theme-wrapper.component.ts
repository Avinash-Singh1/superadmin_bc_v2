import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-theme-wrapper",
  templateUrl: "./theme-wrapper.component.html",
  styleUrls: ["./theme-wrapper.component.scss"],
})
export class ThemeWrapperComponent implements OnInit {
  showFiller: boolean = false;
  // @Input() toggle:boolean=true;
  toggleValue: any = false;
  constructor() {}

  ngOnInit(): void {
    localStorage.setItem("toggleSidenav", "true");
  }

  checkValue() {
    return localStorage.getItem("toggleSidenav"); 
  }
}

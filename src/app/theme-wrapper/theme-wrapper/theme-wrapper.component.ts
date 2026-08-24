import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-theme-wrapper",
  templateUrl: "./theme-wrapper.component.html",
  styleUrls: ["./theme-wrapper.component.scss"],
})
export class ThemeWrapperComponent implements OnInit {
  showFiller: boolean = false;
  isSidebarOpen = true;
  constructor() {}

  ngOnInit(): void {
    const savedState = localStorage.getItem("toggleSidenav");
    this.isSidebarOpen = window.innerWidth > 991 ? savedState !== "false" : false;
    this.persistSidebarState();
  }

  checkValue() {
    return this.isSidebarOpen ? "true" : "false";
  }

  setSidebarOpen(isOpen: boolean): void {
    this.isSidebarOpen = isOpen;
    this.persistSidebarState();
  }

  closeSidebar(): void {
    if (window.innerWidth <= 991) {
      this.setSidebarOpen(false);
    }
  }

  private persistSidebarState(): void {
    localStorage.setItem("toggleSidenav", String(this.isSidebarOpen));
  }
}

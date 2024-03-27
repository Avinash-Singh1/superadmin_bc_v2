import { Component } from "@angular/core";

@Component({
  selector: "nectar-profile-container.",
  templateUrl: "./profile-container.component.html",
  styleUrls: ["./profile-container.component.scss"],
})
export class ProfileContainerComponent {
  constructor() {}

  settingsMenu: any = [
    {
      label: "Profile",
      routerLink: "main",
    },
    {
      label: "Services",
      routerLink: "services",
    },
    {
      label: "FAQs",
      routerLink: "faqs",
    },
    {
      label: "Videos",
      routerLink: "videos",
    },
    {
      label: "Timing",
      routerLink: "timing",
    },
    {
      label: "Address",
      routerLink: "address",
    },
    {
      label: "Images",
      routerLink: "images",
    },
    {
      label: "Social",
      routerLink: "social",
    },
  ];
}

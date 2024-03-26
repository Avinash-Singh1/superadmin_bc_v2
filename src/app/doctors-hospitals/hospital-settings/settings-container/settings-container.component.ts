import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Params } from "@angular/router";
import { EventService } from "src/app/services/event.service";
import { LocalStorageService } from "src/app/services/storage.service";

@Component({
  selector: "nectar-settings-container.",
  templateUrl: "./settings-container.component.html",
  styleUrls: ["./settings-container.component.scss"],
})
export class SettingsContainerComponent implements OnInit {
  constructor(
    private eventService: EventService,
    private route: ActivatedRoute,
    private storageService: LocalStorageService
  ) {}
  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe((paramMap: Params) => {
      this.eventService.broadcastEvent("userId", paramMap["get"]("userId"));
      this.storageService.setItem("userId", paramMap["get"]("userId"));
    });
  }
  openSidenav() {
    this.eventService.broadcastEvent("sidenav", true);
  }
  settingsMenu: any = [
    {
      label: "Profile",
      routerLink: "profile",
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
    // {
    //   label: "Delete Profile",
    //   routerLink: "delete-profile",
    //   red: true,
    // },
  ];
}

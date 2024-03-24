import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Params } from "@angular/router";
import { EventService } from "src/app/services/event.service";
import { LocalStorageService } from "src/app/services/storage.service";

@Component({
  selector: "nectar-settings-container",
  templateUrl: "./settings-container.component.html",
  styleUrls: ["./settings-container.component.scss"],
})
export class SettingsContainerComponent implements OnInit, OnDestroy {
  heading = "Settings";

  constructor(
    private eventService: EventService,
    private route: ActivatedRoute,
    private storageService: LocalStorageService
  ) {}

  ngOnInit(): void {
    this.eventService.broadcastEvent("subheading", this.heading);

    this.route.parent?.paramMap.subscribe((paramMap: Params) => {
      this.eventService.broadcastEvent("userId", paramMap["get"]("userId"));
      this.storageService.setItem("userId", paramMap["get"]("userId"));
    });
  }

  openSidenav() {
    this.eventService.broadcastEvent("sidenav", false);
  }

  ngOnDestroy(): void {
    this.storageService.removeItem("userId");
  }
}

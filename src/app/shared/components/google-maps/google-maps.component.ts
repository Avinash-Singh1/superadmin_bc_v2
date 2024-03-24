import { MapsAPILoader } from "@agm/core";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

@Component({
  selector: "nectar-google-maps",
  templateUrl: "./google-maps.component.html",
  styleUrls: ["./google-maps.component.scss"],
})
export class GoogleMapsComponent implements OnInit {
  constructor(private mapApiLoader: MapsAPILoader) {}
  @Input() lat: number = 28.6448;
  @Input() lng: number = 77.216721;
  @Input() zoom: number = 10;

  @Input() markerDragable: boolean = true;

  ngOnInit(): void {}
  countryRestriction = {
    latLngBounds: {
      east: 7.798,
      north: 68.14712,
      south: 37.09,
      west: 97.34466,
    },
    strictBounds: true,
  };
  mapType = "roadmap";
  @Output() mapClicked = new EventEmitter();
  @Output() markerDrag = new EventEmitter();
  onMapReady(map: google.maps.Map) {
    map.addListener("click", (event: google.maps.MapMouseEvent) => {
      this.mapApiLoader.load().then(() => {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: event.latLng }, (results, status) => {
          if (status === "OK" && results[0]) {
            const placeId = results[0].place_id;
            this.mapClicked.emit({
              place_id: placeId,
              location: {
                cordinates: [event.latLng.lng(), event.latLng.lat()],
              },
            });
          } else {
            console.error("Geocoder failed:", status);
          }
        });
      });
    });
  }
  markerDragEnd(event: any) {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: event.coords }, (results, status) => {
      if (status === "OK" && results[0]) {
        const placeId = results[0].place_id;
        this.markerDrag.emit({
          place_id: placeId,
          location: {
            cordinates: [event.coords.lng, event.coords.lat],
          },
        });
      } else {
        console.error("Geocoder failed:", status);
      }
    });
  }
}

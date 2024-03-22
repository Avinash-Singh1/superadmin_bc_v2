import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import { LocalStorageService } from "./storage.service";
import { MapsAPILoader } from "@agm/core";
import { environment } from "src/environments/environment";
import { Observable, catchError, map, of } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { DOCUMENT, isPlatformBrowser } from "@angular/common";

declare var google: any;

@Injectable({
  providedIn: "root",
})
export class GoogleMapsService {
  placeService: any;
  constructor(
    private localStorage: LocalStorageService,
    private mapApiLoader: MapsAPILoader,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: object,
    @Inject(DOCUMENT) private _document: Document
  ) {
    if (isPlatformBrowser(this.platformId))
      this.getLocation({
        address:
          "H-47-48, Shaheed Arjun Sardana Marg, near Kailash Hospital Sector 27 Noida, H Block, Pocket H, Sector 27, Noida, Uttar Pradesh 201301",
      });
  }

  getCurrentCityObs(): Observable<string | null> {
    return new Observable<string | null>((observer) => {
      if (navigator.geolocation || "geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            this.reverseGeocode(latitude, longitude).subscribe(
              (city) => {
                observer.next(city);
                observer.complete();
              },
              (error) => {
                observer.error(error);
              }
            );
          },
          (error) => {
            observer.error(error);
          }
        );
      } else {
        observer.error("Geolocation is not available in this browser.");
      }
    });
  }

  private reverseGeocode(
    latitude: number,
    longitude: number
  ): Observable<string | null> {
    const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${environment.GOOGLE_API_KEY}`;

    return this.http.get<any>(geocodingUrl).pipe(
      map((data) => {
        const results = data.results;
        if (results.length > 0) {
          const addressComponents = results[0].address_components;
          let city = null;
          for (const component of addressComponents) {
            if (component.types.includes("locality")) {
              city = component.long_name;
              break;
            }
          }
          return city;
        }
        return null;
      }),
      catchError((error) => {
        console.log("Error getting city:", error);
        return of(null);
      })
    );
  }

  getCurrentCity(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const latlng = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            this.localStorage.setItem(
              "coordinates",
              JSON.stringify([
                position.coords.longitude,
                position.coords.latitude,
              ])
            );
            this.mapApiLoader.load().then(() => {
              const geocoder = new google.maps.Geocoder();
              geocoder.geocode(
                { location: latlng },
                (results: any, status: any) => {
                  if (status === google.maps.GeocoderStatus.OK) {
                    const countryComponent = results[0].address_components.find(
                      (item: any) => item.types.includes("country")
                    );
                    this.localStorage.setItem(
                      "country",
                      countryComponent?.long_name
                    );
                    const cityComponent = results[0].address_components.find(
                      (item: any) => item.types.includes("locality")
                    );
                    if (cityComponent) {
                      resolve(cityComponent.long_name);
                    } else {
                      reject("Unable to determine current city.");
                    }
                  }
                }
              );
            });
          },
          (error) => {
            reject("Geolocation error: " + error.message);
          }
        );
      } else {
        reject("Geolocation is not supported by this browser.");
      }
    });
  }
  redirectToGoogleMaps(lat: number, lng: number) {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    window.open(url, "_blank");
  }
  getPredication(search: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.mapApiLoader.load().then(() => {
        const autocompleteService =
          new google.maps.places.AutocompleteService();
        autocompleteService.getPlacePredictions(
          {
            input: search,
            componentRestrictions: { country: "in" },
          },
          (predictions: any, status: any) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
              resolve(predictions);
            } else {
              reject([]);
            }
          }
        );
      });
    });
  }
  getAddressComponents(placeId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.mapApiLoader.load().then(() => {
        let geocoder = new google.maps.Geocoder();
        geocoder.geocode({ placeId }, (results: any, status: any) => {
          if (status == google.maps.GeocoderStatus.OK) {
            return resolve(results[0]);
          }
          reject(status);
        });
      });
    });
  }
  getLocation(payload: any) {
    return new Promise((resolve, reject) => {
      this.mapApiLoader.load().then(() => {
        let geocoder = new google.maps.Geocoder();
        geocoder.geocode(payload, (results: any, status: any) => {
          if (status == google.maps.GeocoderStatus.OK) {
            return resolve(results);
          }
          reject(status);
        });
      });
    });
  }
  getLandmark(query: string) {
    return new Promise((resolve, reject) => {
      this.mapApiLoader.load().then(() => {
        const placeServive = new google.maps.places.PlacesService(
          this._document.createElement("div")
        );
        placeServive.textSearch({ query }, (results: any, status: any) => {});
      });
    });
  }
}

import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { CryptoProvider } from "./crypto.service";

@Injectable({
  providedIn: "root",
})
export class LocalStorageService {
  private langUpdated = new Subject<string>();

  constructor(private crypto: CryptoProvider) {}
  setItem(key: string, value: any) {
    const encStoreInfo = this.crypto.encryptObj(value);
    localStorage.setItem(key, encStoreInfo);
  }

  removeItem(key: any) {
    localStorage.removeItem(key);
  }

  removeAllItem() {
    localStorage.clear();
  }
  getItem(key: string): any {
    try {
      let localStorageInfo;
      const encStoreInfo = localStorage.getItem(key);
      if (encStoreInfo) {
        localStorageInfo = this.crypto.decryptObj(localStorage.getItem(key));
      }
      return localStorageInfo;
    } catch (err) {
      return "";
    }
  }
  removeItems(keyArray: any) {
    keyArray.forEach((key: any) => localStorage.removeItem(key));
  }
  storageclear() {
    localStorage.clear();
  }

  storeinSession(key: string, data: any) {
    sessionStorage.setItem(key, data);
  }

  getdatafromSession(key: any) {
    return sessionStorage.getItem(key);
  }

  sessionStorageclear() {
    sessionStorage.clear();
  }

  getLang(): Observable<string> {
    return this.langUpdated.asObservable();
  }

  setLang() {
    const lang = this.getItem("currentlang");
    this.langUpdated.next(lang ? lang : "en");
  }
}

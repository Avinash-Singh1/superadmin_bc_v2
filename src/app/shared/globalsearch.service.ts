import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class GlobalsearchService {
  private searchSubject: Subject<string> = new Subject<string>();

  constructor() {
   }
   search(term: string) {
    this.searchSubject.next(term);
  }
  getSearchValue(){
   return this.searchSubject.asObservable()
  }
}




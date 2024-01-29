import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { GlobalsearchService } from 'src/app/shared/globalsearch.service';

@Component({
  selector: 'app-delete-reject-inactive-wrapper',
  templateUrl: './delete-reject-inactive-wrapper.component.html',
  styleUrls: ['./delete-reject-inactive-wrapper.component.scss']
})
export class DeleteRejectInactiveWrapperComponent implements OnInit {
  deleteRejectInactiveList: any = [
    {
      link:'Deleted',
      routerLink:'/theme/delete-reject-inactive'
    },
    {
      link:'Rejected',
      routerLink:'/theme/delete-reject-inactive/rejected'

    },
    {
      link:'Inactive',
      routerLink:'/theme/delete-reject-inactive/inactive'

    },
  ]
  searchTerm: string = '';

  constructor(private route: Router,private searchService: GlobalsearchService) {
   
   }
   searchControl=new FormControl
  ngOnInit(): void {
  }

  search() {
    this.searchService.search(this.searchTerm);

    // this.searchControl.valueChanges.
    // pipe(
    //   debounceTime(500),distinctUntilChanged()
    // ).subscribe(val=> this.searchService.search(val)
    // )
  }
 checkCurrentRoute(item: any) {
    if (this.route.url == item) {
      return true;
    }
    return false;
  }
  clearSearch(){
    this.searchTerm=''
  }
 
}

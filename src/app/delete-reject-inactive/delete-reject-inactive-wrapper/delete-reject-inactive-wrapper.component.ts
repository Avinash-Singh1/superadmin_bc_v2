import { Component, OnInit, OnDestroy } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GlobalsearchService } from 'src/app/shared/globalsearch.service';

@Component({
  selector: 'app-delete-reject-inactive-wrapper',
  templateUrl: './delete-reject-inactive-wrapper.component.html',
  styleUrls: ['./delete-reject-inactive-wrapper.component.scss']
})
export class DeleteRejectInactiveWrapperComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  deleteRejectInactiveList: any = [
    {
      link: 'Deleted',
      routerLink: '/theme/delete-reject-inactive'
    },
    {
      link: 'Rejected',
      routerLink: '/theme/delete-reject-inactive/rejected'
    },
    {
      link: 'Inactive',
      routerLink: '/theme/delete-reject-inactive/inactive'
    },
  ];
  
  searchTerm: string = '';
  searchControl = new UntypedFormControl('');

  constructor(
    private route: Router,
    private searchService: GlobalsearchService
  ) {}

  ngOnInit(): void {
    // Setup debounced search
    this.searchControl.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(val => {
        this.searchTerm = val || '';
        this.searchService.search(this.searchTerm);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  checkCurrentRoute(item: any): boolean {
    return this.route.url === item;
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.searchControl.setValue('', { emitEvent: false });
    this.searchService.search('');
  }

  onSearchChange(): void {
    this.searchControl.setValue(this.searchTerm);
  }
}

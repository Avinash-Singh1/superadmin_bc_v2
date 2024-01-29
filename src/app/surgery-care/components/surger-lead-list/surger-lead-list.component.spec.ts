import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurgerLeadListComponent } from './surger-lead-list.component';

describe('SurgerLeadListComponent', () => {
  let component: SurgerLeadListComponent;
  let fixture: ComponentFixture<SurgerLeadListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SurgerLeadListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SurgerLeadListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

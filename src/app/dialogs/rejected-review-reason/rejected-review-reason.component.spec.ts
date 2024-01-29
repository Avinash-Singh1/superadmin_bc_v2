import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RejectedReviewReasonComponent } from './rejected-review-reason.component';

describe('RejectedReviewReasonComponent', () => {
  let component: RejectedReviewReasonComponent;
  let fixture: ComponentFixture<RejectedReviewReasonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RejectedReviewReasonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RejectedReviewReasonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

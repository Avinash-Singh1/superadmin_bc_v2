import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcceptRejectComponent } from './accept-reject.component';

describe('AcceptRejectComponent', () => {
  let component: AcceptRejectComponent;
  let fixture: ComponentFixture<AcceptRejectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AcceptRejectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AcceptRejectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

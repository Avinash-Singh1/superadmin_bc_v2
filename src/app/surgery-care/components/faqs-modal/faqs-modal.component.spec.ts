import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaqsModalComponent } from './faqs-modal.component';

describe('FaqsModalComponent', () => {
  let component: FaqsModalComponent;
  let fixture: ComponentFixture<FaqsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FaqsModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FaqsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

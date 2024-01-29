import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteFaqComponent } from './delete-faq.component';

describe('DeleteFaqComponent', () => {
  let component: DeleteFaqComponent;
  let fixture: ComponentFixture<DeleteFaqComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeleteFaqComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteFaqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

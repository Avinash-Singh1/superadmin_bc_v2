import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteRejectInactiveWrapperComponent } from './delete-reject-inactive-wrapper.component';

describe('DeleteRejectInactiveWrapperComponent', () => {
  let component: DeleteRejectInactiveWrapperComponent;
  let fixture: ComponentFixture<DeleteRejectInactiveWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeleteRejectInactiveWrapperComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteRejectInactiveWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

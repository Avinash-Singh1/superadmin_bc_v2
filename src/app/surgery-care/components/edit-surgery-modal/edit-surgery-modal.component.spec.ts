import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSurgeryModalComponent } from './edit-surgery-modal.component';

describe('EditSurgeryModalComponent', () => {
  let component: EditSurgeryModalComponent;
  let fixture: ComponentFixture<EditSurgeryModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditSurgeryModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditSurgeryModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

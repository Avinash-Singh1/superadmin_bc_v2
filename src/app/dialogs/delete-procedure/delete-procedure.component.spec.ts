import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteProcedureComponent } from './delete-procedure.component';

describe('DeleteProcedureComponent', () => {
  let component: DeleteProcedureComponent;
  let fixture: ComponentFixture<DeleteProcedureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeleteProcedureComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteProcedureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

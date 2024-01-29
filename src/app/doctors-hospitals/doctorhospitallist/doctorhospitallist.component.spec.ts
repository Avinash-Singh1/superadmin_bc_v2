import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorhospitallistComponent } from './doctorhospitallist.component';

describe('DoctorhospitallistComponent', () => {
  let component: DoctorhospitallistComponent;
  let fixture: ComponentFixture<DoctorhospitallistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DoctorhospitallistComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DoctorhospitallistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

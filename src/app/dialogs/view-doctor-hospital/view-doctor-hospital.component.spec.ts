import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDoctorHospitalComponent } from './view-doctor-hospital.component';

describe('ViewDoctorHospitalComponent', () => {
  let component: ViewDoctorHospitalComponent;
  let fixture: ComponentFixture<ViewDoctorHospitalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewDoctorHospitalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewDoctorHospitalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

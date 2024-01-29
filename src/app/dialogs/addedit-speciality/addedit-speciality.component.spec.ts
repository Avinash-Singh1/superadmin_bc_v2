import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddeditSpecialityComponent } from './addedit-speciality.component';

describe('AddeditSpecialityComponent', () => {
  let component: AddeditSpecialityComponent;
  let fixture: ComponentFixture<AddeditSpecialityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddeditSpecialityComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddeditSpecialityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingWrapperComponent } from './setting-wrapper.component';

describe('SettingWrapperComponent', () => {
  let component: SettingWrapperComponent;
  let fixture: ComponentFixture<SettingWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SettingWrapperComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

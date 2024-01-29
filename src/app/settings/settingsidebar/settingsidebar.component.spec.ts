import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsidebarComponent } from './settingsidebar.component';

describe('SettingsidebarComponent', () => {
  let component: SettingsidebarComponent;
  let fixture: ComponentFixture<SettingsidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SettingsidebarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

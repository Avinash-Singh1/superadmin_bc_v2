import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowFullViewComponent } from './show-full-view.component';

describe('ShowFullViewComponent', () => {
  let component: ShowFullViewComponent;
  let fixture: ComponentFixture<ShowFullViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShowFullViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowFullViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

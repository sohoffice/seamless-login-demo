import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PunchPageComponent } from './punch-page.component';

describe('PunchPageComponent', () => {
  let component: PunchPageComponent;
  let fixture: ComponentFixture<PunchPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PunchPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PunchPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

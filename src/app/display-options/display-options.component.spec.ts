import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayOptionsComponent } from './display-options.component';

describe('DisplayOptionsComponent', () => {
  let component: DisplayOptionsComponent;
  let fixture: ComponentFixture<DisplayOptionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DisplayOptionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisplayOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RangeRequestsComponent } from './range-requests.component';

describe('RangeRequestsComponent', () => {
  let component: RangeRequestsComponent;
  let fixture: ComponentFixture<RangeRequestsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RangeRequestsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RangeRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

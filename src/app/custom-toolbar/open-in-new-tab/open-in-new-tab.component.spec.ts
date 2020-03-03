import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenInNewTabComponent } from './open-in-new-tab.component';

describe('OpenInNewTabComponent', () => {
  let component: OpenInNewTabComponent;
  let fixture: ComponentFixture<OpenInNewTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpenInNewTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenInNewTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

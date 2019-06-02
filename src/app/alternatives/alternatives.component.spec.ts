import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlternativesComponent } from './alternatives.component';

describe('AlternativesComponent', () => {
  let component: AlternativesComponent;
  let fixture: ComponentFixture<AlternativesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlternativesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlternativesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

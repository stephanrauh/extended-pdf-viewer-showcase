import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefaultRoutesComponent } from './default-routes.component';

describe('DefaultRoutesComponent', () => {
  let component: DefaultRoutesComponent;
  let fixture: ComponentFixture<DefaultRoutesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DefaultRoutesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DefaultRoutesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

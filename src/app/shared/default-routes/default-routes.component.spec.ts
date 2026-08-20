import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { DefaultRoutesComponent } from './default-routes.component';

describe('DefaultRoutesComponent', () => {
  let component: DefaultRoutesComponent;
  let fixture: ComponentFixture<DefaultRoutesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DefaultRoutesComponent],
      // The component injects Router and ActivatedRoute.
      providers: [provideRouter([])],
    }).compileComponents();
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

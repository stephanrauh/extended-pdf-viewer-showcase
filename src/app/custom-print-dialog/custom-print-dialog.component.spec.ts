import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomPrintDialogComponent } from './custom-print-dialog.component';

describe('CustomPrintDialogComponent', () => {
  let component: CustomPrintDialogComponent;
  let fixture: ComponentFixture<CustomPrintDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomPrintDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomPrintDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

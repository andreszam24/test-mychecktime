import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShiftHandoverPage } from './shift-handover.page';

describe('ShiftHandoverPage', () => {
  let component: ShiftHandoverPage;
  let fixture: ComponentFixture<ShiftHandoverPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ShiftHandoverPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

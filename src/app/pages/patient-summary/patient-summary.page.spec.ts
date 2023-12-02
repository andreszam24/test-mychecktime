import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PatientSummaryPage } from './patient-summary.page';

describe('PatientSummaryPage', () => {
  let component: PatientSummaryPage;
  let fixture: ComponentFixture<PatientSummaryPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(PatientSummaryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

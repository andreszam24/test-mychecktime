import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PatientIntakePage } from './patient-intake.page';

describe('PatientIntakePage', () => {
  let component: PatientIntakePage;
  let fixture: ComponentFixture<PatientIntakePage>;

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(PatientIntakePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

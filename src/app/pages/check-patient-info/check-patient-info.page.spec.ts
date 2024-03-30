import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CheckPatientInfoPage } from './check-patient-info.page';

describe('CheckPatientInfoPage', () => {
  let component: CheckPatientInfoPage;
  let fixture: ComponentFixture<CheckPatientInfoPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(CheckPatientInfoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

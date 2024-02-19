import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HospitalizationDestinationPage } from './hospitalization-destination.page';

describe('HospitalizationDestinationPage', () => {
  let component: HospitalizationDestinationPage;
  let fixture: ComponentFixture<HospitalizationDestinationPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(HospitalizationDestinationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SurgeryDestinationPage } from './surgery-destination.page';

describe('SurgeryDestinationPage', () => {
  let component: SurgeryDestinationPage;
  let fixture: ComponentFixture<SurgeryDestinationPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(SurgeryDestinationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

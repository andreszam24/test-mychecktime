import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeceaseDestinationPage } from './decease-destination.page';

describe('DeceaseDestinationPage', () => {
  let component: DeceaseDestinationPage;
  let fixture: ComponentFixture<DeceaseDestinationPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(DeceaseDestinationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

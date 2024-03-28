import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DestinationSelectionPage } from './destination-selection.page';

describe('DestinationSelectionPage', () => {
  let component: DestinationSelectionPage;
  let fixture: ComponentFixture<DestinationSelectionPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(DestinationSelectionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

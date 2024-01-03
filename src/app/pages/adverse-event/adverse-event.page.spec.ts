import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdverseEventPage } from './adverse-event.page';

describe('AdverseEventPage', () => {
  let component: AdverseEventPage;
  let fixture: ComponentFixture<AdverseEventPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(AdverseEventPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TransfusionPage } from './transfusion.page';

describe('TransfusionPage', () => {
  let component: TransfusionPage;
  let fixture: ComponentFixture<TransfusionPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(TransfusionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

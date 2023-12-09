import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PreAnesthesiaPage } from './pre-anesthesia.page';

describe('PreAnesthesiaPage', () => {
  let component: PreAnesthesiaPage;
  let fixture: ComponentFixture<PreAnesthesiaPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(PreAnesthesiaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

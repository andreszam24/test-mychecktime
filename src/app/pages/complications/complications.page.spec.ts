import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComplicationsPage } from './complications.page';

describe('ComplicationsPage', () => {
  let component: ComplicationsPage;
  let fixture: ComponentFixture<ComplicationsPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ComplicationsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

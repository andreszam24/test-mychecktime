import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StartProcesPage } from './start-proces.page';

describe('StartProcesPage', () => {
  let component: StartProcesPage;
  let fixture: ComponentFixture<StartProcesPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(StartProcesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

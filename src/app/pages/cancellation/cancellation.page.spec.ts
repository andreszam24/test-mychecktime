import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CancellationPage } from './cancellation.page';

describe('CancellationPage', () => {
  let component: CancellationPage;
  let fixture: ComponentFixture<CancellationPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(CancellationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

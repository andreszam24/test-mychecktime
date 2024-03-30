import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UCIDestinationPage } from './uci-destination.page';

describe('UCIDestinationPage', () => {
  let component: UCIDestinationPage;
  let fixture: ComponentFixture<UCIDestinationPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(UCIDestinationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

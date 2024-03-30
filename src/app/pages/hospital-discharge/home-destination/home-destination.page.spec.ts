import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeDestinationPage } from './home-destination.page';

describe('HomeDestinationPage', () => {
  let component: HomeDestinationPage;
  let fixture: ComponentFixture<HomeDestinationPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(HomeDestinationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

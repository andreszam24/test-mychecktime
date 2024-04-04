import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExitMenuPage } from './exit-menu.page';

describe('ExitMenuPage', () => {
  let component: ExitMenuPage;
  let fixture: ComponentFixture<ExitMenuPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ExitMenuPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

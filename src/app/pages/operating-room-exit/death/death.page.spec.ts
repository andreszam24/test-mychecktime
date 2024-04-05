import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeathPage } from './death.page';

describe('DeathPage', () => {
  let component: DeathPage;
  let fixture: ComponentFixture<DeathPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(DeathPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

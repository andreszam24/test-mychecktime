import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OperatingRoomExitPage } from './operating-room-exit.page';

describe('OperatingRoomExitPage', () => {
  let component: OperatingRoomExitPage;
  let fixture: ComponentFixture<OperatingRoomExitPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(OperatingRoomExitPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

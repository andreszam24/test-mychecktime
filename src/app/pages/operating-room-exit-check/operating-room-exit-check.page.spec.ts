import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OperatingRoomExitCheckPage } from './operating-room-exit-check.page';

describe('OperatingRoomExitCheckPage', () => {
  let component: OperatingRoomExitCheckPage;
  let fixture: ComponentFixture<OperatingRoomExitCheckPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(OperatingRoomExitCheckPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

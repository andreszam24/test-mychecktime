import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OperatingRoomListPage } from './operating-room-list.page';

describe('OperatingRoomListPage', () => {
  let component: OperatingRoomListPage;
  let fixture: ComponentFixture<OperatingRoomListPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(OperatingRoomListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

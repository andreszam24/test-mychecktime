import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectOperatingRoomPage } from './select-operating-room.page';

describe('SelectOperatingRoomPage', () => {
  let component: SelectOperatingRoomPage;
  let fixture: ComponentFixture<SelectOperatingRoomPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(SelectOperatingRoomPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

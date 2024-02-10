import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnesthesiaOperatingRoomPage } from './anesthesia-operating-room.page';

describe('AnesthesiaOperatingRoomPage', () => {
  let component: AnesthesiaOperatingRoomPage;
  let fixture: ComponentFixture<AnesthesiaOperatingRoomPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(AnesthesiaOperatingRoomPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

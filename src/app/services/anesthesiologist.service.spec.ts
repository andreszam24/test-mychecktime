import { TestBed } from '@angular/core/testing';

import { AnesthesiologistService } from './anesthesiologist.service';

describe('AnesthesiologistService', () => {
  let service: AnesthesiologistService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnesthesiologistService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

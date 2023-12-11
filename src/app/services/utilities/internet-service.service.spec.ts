import { TestBed } from '@angular/core/testing';

import { InternetServiceService } from './internet-service.service';

describe('InternetServiceService', () => {
  let service: InternetServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InternetServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

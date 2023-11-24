import { TestBed } from '@angular/core/testing';

import { InProgressMedicalAttentionService } from './in-progress-medical-attention.service';

describe('InProgressMedicalAttentionService', () => {
  let service: InProgressMedicalAttentionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InProgressMedicalAttentionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

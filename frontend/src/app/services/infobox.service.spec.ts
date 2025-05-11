import { TestBed } from '@angular/core/testing';

import { InfoboxService } from './infobox.service';

describe('InfoboxService', () => {
  let service: InfoboxService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InfoboxService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

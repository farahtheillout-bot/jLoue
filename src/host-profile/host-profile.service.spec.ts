import { Test, TestingModule } from '@nestjs/testing';
import { HostProfileService } from './host-profile.service';

describe('HostProfileService', () => {
  let service: HostProfileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HostProfileService],
    }).compile();

    service = module.get<HostProfileService>(HostProfileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

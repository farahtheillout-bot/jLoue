import { Test, TestingModule } from '@nestjs/testing';
import { HostProfileController } from './host-profile.controller';

describe('HostProfileController', () => {
  let controller: HostProfileController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HostProfileController],
    }).compile();

    controller = module.get<HostProfileController>(HostProfileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

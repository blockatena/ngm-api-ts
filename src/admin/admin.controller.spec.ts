import { Test, TestingModule } from '@nestjs/testing';
import { CronjobService } from 'src/services/cronjob.service';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { SubscriptionService } from './subscription.service';

describe('AdminController', () => {
  let controller: AdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [AdminService, SubscriptionService, CronjobService],
    }).compile();

    controller = module.get<AdminController>(AdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

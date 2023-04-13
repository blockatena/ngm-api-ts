import { Test, TestingModule } from '@nestjs/testing';
import { DeploymentController } from './deployment.controller';
import { DeploymentService } from './deployment.service';

describe('DeploymentController', () => {
  let controller: DeploymentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeploymentController],
      providers: [DeploymentService],
    }).compile();

    controller = module.get<DeploymentController>(DeploymentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { DeploymentService } from './deployment.service';

describe('DeploymentService', () => {
  let service: DeploymentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeploymentService],
    }).compile();

    service = module.get<DeploymentService>(DeploymentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

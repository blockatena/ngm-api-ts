import { Test, TestingModule } from '@nestjs/testing';
import { TextileService } from './textile.service';

describe('TextileService', () => {
  let service: TextileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TextileService],
    }).compile();

    service = module.get<TextileService>(TextileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

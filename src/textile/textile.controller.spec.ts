import { Test, TestingModule } from '@nestjs/testing';
import { TextileController } from './textile.controller';
import { TextileService } from './textile.service';

describe('TextileController', () => {
  let controller: TextileController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TextileController],
      providers: [TextileService],
    }).compile();

    controller = module.get<TextileController>(TextileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

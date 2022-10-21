import { Test, TestingModule } from '@nestjs/testing';
import { NftMarketplaceController } from './nft-marketplace.controller';
import { NftMarketplaceService } from './nft-marketplace.service';

describe('NftMarketplaceController', () => {
  let controller: NftMarketplaceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NftMarketplaceController],
      providers: [NftMarketplaceService],
    }).compile();

    controller = module.get<NftMarketplaceController>(NftMarketplaceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

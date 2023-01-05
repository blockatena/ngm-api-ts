import { Test, TestingModule } from '@nestjs/testing';
import { NftMarketplaceService } from './nft-marketplace.service';

describe('NftMarketplaceService', () => {
  let service: NftMarketplaceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NftMarketplaceService],
    }).compile();

    service = module.get<NftMarketplaceService>(NftMarketplaceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

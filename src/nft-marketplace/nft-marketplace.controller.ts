import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { check } from 'prettier';
import { NftService } from 'src/nft/nft.service';
import { CreateAuctionBody } from './dtos/create_auction.dto';
import { CreateBidBody } from './dtos/create_bid.dto';
import { NftMarketplaceService } from './nft-marketplace.service';
@ApiTags('market-place')
@Controller('nft-marketplace')
export class NftMarketplaceController {
  constructor(
    private readonly nftMarketplaceService: NftMarketplaceService,
    private readonly nftService: NftService,
  ) {}

  @Post('create-nft-auction')
  async create_Auction(
    @Body() Create_Auction: CreateAuctionBody,
  ): Promise<any> {
    const { owner_address, token_id } = Create_Auction;

    console.log(Create_Auction);

    const checkCretedetials = { owner_address, token_id };
    // if he/she is the owner then only he/she can put the nft ITEM on Auction
    try {
      let check_is_owner = await this.nftMarketplaceService.get_Nft(
        checkCretedetials,
      );
      if (!check_is_owner) {
        return 'You are not the owner of the NFT';
      }
      //  checking if this NFT is already in auction or not
      if (check_is_owner.is_in_auction) {
        return 'This NFT is Already in Auction';
      }

      // check he is the owner of nft or not
      // check if it placed in any other auction or not
      return await this.nftMarketplaceService.create_auction(Create_Auction);
    } catch (err) {
      console.log(err);
      return 'something wrontg in the system';
    }
  }

  @Post('cancel-auction')
  async cancel_auction(@Body() auction_id: string) {
    await this.nftMarketplaceService.cancel_auction(auction_id);
  }
  @Post('cancel-bid')
  async cancel_bid(@Body() bid_id: string) {
    await this.nftMarketplaceService.cancel_bid(bid_id);
  }
  @Post('create-nft-offer')
  async create_offer() {}
  @Post('put-for-sale-fixed-price')
  async put_sale_fixed_price() {}
  @Post('place-nft-bid')
  async create_bid(@Body() Create_Bid: CreateBidBody) {
    //  nft_id auction id bidding price
    const { token_id, auction_id, bid_amount, bidder_address, bid_expiresin } =
      Create_Bid;

    // wallet adders
    const is_nft_exists = await this.nftMarketplaceService.get_Nft({
      token_id,
    });
    console.log(is_nft_exists);
    if (!is_nft_exists) {
      return 'There is no Nft associated with this token ID , Kindly check that Token ID is valid or not or may be that nft wont exists or lost';
    }
    if (!is_nft_exists.is_in_auction) {
      return 'Nft is not available for auction';
    }
    console.log(is_nft_exists.is_in_auction);
    const is_auction_exists = await this.nftMarketplaceService.get_auction(
      auction_id,
    );
    console.log(is_auction_exists);
    if (!is_auction_exists) {
      return 'Invalid Auction Id';
    }
    // const is_already_bidded = await this.nftMarketplaceService.get_bid({
    //   auction_id,
    //   token_id,
    // });
    // console.log(is_already_bidded);
    // if (is_already_bidded) {
    //   return 'You alread bidded for that Nft want to lower the price ?';
    // }
    console.log('no problem in controller');
    await this.nftMarketplaceService.create_bid(Create_Bid);
  }
  @Post('change-nft-bid-price')
  async change_bid_price() {}
  @Post('get-bid-list-by-auction')
  async get_bid_list_for_auction(auction_id: string) {}
  @Post('get-all-offers')
  async get_all_offers() {}
  @Post('accept-bid')
  async accept_bid() {}
  @Post('accept-offers')
  async accept_offers() {}

  // dev
  @Get('allcronjobs')
  async getallcronjobs() {
    return this.nftMarketplaceService.getCrons();
  }
  //
}

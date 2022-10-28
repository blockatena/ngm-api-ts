import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NftService } from 'src/nft/nft.service';
import { create_Offer_Body } from './dtos/create_offer.dto';
import {
  CancelAuctionBody,
  CreateAuctionBody,
  get_All_Bids,
} from './dtos/create_auction.dto';
import { Acceptbid, CancelBidBody, CreateBidBody } from './dtos/create_bid.dto';
import { NftMarketplaceService } from './nft-marketplace.service';
@ApiTags('market-place')
@Controller('nft-marketplace')
export class NftMarketplaceController {
  constructor(private readonly nftMarketplaceService: NftMarketplaceService) {}

  @Post('create-nft-auction')
  async create_Auction(
    @Body() Create_Auction: CreateAuctionBody,
  ): Promise<any> {
    const { token_owner, token_id } = Create_Auction;

    console.log(Create_Auction);

    const checkCretedetials = { token_owner, token_id };
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
  async cancel_auction(@Body() auction_id: CancelAuctionBody): Promise<any> {
    return await this.nftMarketplaceService.cancel_auction(
      auction_id.auction_id,
      auction_id.cronjob_id,
    );
  }
  @Post('cancel-bid')
  async cancel_bid(@Body() body: CancelBidBody) {
    return await this.nftMarketplaceService.cancel_bid(body);
  }
  @Post('create-nft-offer')
  async create_offer(body: create_Offer_Body) {
    try {
      const { token_id, offer_currency, offer_price } = body;
    } catch (error) {
      console.log(error);
      return {
        message:
          'something went wrong, our team will resolve it as soon as possible ,Appreciating your patience',
      };
    }
  }
  @Post('put-for-sale-fixed-price')
  async put_sale_fixed_price() {}
  @Post('place-nft-bid')
  async create_bid(@Body() Create_Bid: CreateBidBody) {
    //  nft_id auction id bidding price
    const {
      token_id,
      auction_id,
      bid_amount,
      bidder_address,
      bid_expiresin,
      contract_address,
    } = Create_Bid;

    // wallet adders
    const is_nft_exists = await this.nftMarketplaceService.get_Nft({
      token_id,
      contract_address,
    });
    console.log(is_nft_exists);
    if (!is_nft_exists) {
      return 'There is no Nft associated with this token ID , Kindly check that Token ID is valid or not or may be that nft wont exists or lost';
    }
    if (!is_nft_exists.is_in_auction) {
      return 'Nft is not available for auction';
    }
    console.log(is_nft_exists.is_in_auction);
    const is_auction_exists = await this.nftMarketplaceService.get_auction({
      _id: auction_id,
    });
    console.log(is_auction_exists);
    if (!is_auction_exists) {
      return 'Invalid Auction Id';
    }
    //  bid amount should be greater than min amount
    if (bid_amount < is_auction_exists.min_price) {
      return `Minium weth required for this Auction is ${is_auction_exists.min_price}`;
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
    return await this.nftMarketplaceService.create_bid(Create_Bid);
  }
  @Post('change-nft-bid-price')
  async change_bid_price() {}
  @Post('get-bid-list-by-auction')
  async get_bid_list_for_auction(@Body() body: get_All_Bids) {
    try {
      //Auction
      const { skip, limit, token_id, auction_id } = body;
      const skipp = Number(skip) || 0;
      const limitt = Number(limit) || 20;
    } catch (error) {
      console.log(error);
    }
  }
  @Post('get-all-offers')
  async get_all_offers() {}
  @Post('accept-bid')
  async accept_bid(@Body() body: Acceptbid) {
    try {
      const { auction_id, bid_id } = body;
      const auction_data = await this.nftMarketplaceService.get_auction({
        _id: auction_id,
      });
      //  validate auction
      if (!auction_data) {
        return 'Invalid Auction Id, Please check auction is present or not';
      }
      // validate Nft
      const nft_data = await this.nftMarketplaceService.get_Nft({
        token_id: auction_data.token_id,
        token_owner: auction_data.token_owner,
      });
      if (!nft_data) {
        return 'You are not owner of the NFT';
      }
      // validate Bid

      const bid_data = await this.nftMarketplaceService.get_bid({
        _id: bid_id,
      });
      if (!bid_data) {
        return 'There is no bid associated with that bid Id please check ';
      }
      //  All validations are now , now we are transferring the nft
      // ********* please add block chain code to transfer NFT

      // *********

      const dbmsg = await this.nftMarketplaceService.update_nft(
        {
          contract_address: nft_data.contract_address,
          token_id: nft_data.token_id,
        },
        { token_owner: bid_data.bidder_address },
      );
      return {
        message: 'Bid accepted and transferred the ownership of the NFT',
        status: dbmsg,
      };
    } catch (error) {
      console.error(error);
      return {
        messge: 'something went wrong ,Please wait our team is working on it',
      };
    }
  }
  @Post('accept-offers')
  async accept_offers() {}

  // dev
  @Get('allcronjobs')
  async getallcronjobs() {
    return this.nftMarketplaceService.getCrons();
  }
  //
  // Get all collections
  @Get('get-collections')
  async getcollections(): Promise<any> {
    return await this.nftMarketplaceService.getcollections();
  }
}

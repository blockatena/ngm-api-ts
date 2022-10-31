import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  accept_Offer_Body,
  create_Offer_Body,
  get_all_offers_Body,
} from './dtos/create_offer.dto';
import {
  CancelAuctionBody,
  CreateAuctionBody,
  get_All_Bids,
} from './dtos/create_auction.dto';
import { Acceptbid, CancelBidBody, CreateBidBody } from './dtos/create_bid.dto';
import { NftMarketplaceService } from './nft-marketplace.service';
import { Cancel_Sale_Body, Create_Sale_Body } from './dtos/create-sale.dto';
@ApiTags('market-place')
@Controller('nft-marketplace')
export class NftMarketplaceController {
  constructor(private readonly nftMarketplaceService: NftMarketplaceService) {}
  /*********************[CREATE-AUCTION]*****************/
  /*[Documentation]*/
  @ApiOperation({
    summary: 'This API creates an Auction for a NFT',
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully created Auction',
  })
  @ApiResponse({
    status: 400,
    description: 'Something went wrong',
  })
  /*[ROUTER-FUNCTION]*/
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

      if (check_is_owner.is_in_sale) {
        return 'This Nft is already in  sale you cant put it in Auction ,Please Cancel that sale and try again';
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
  /*********************[CANCEL-AUCTION]*******************/
  @ApiOperation({
    summary: 'This Api Cancels the Auction',
  })
  @Post('cancel-auction')
  async cancel_auction(@Body() auction_id: CancelAuctionBody): Promise<any> {
    return await this.nftMarketplaceService.cancel_auction(
      auction_id.auction_id,
      auction_id.cronjob_id,
    );
  }
  /*********************[CREATE-BID]***********************/
  @ApiOperation({
    summary: 'This Api will  Place a bid for an NFT which is in auction',
  })
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
  /*********************[CANCEL-BID]***********************/
  @ApiOperation({
    summary: 'This Api will Cancel  a bid for an NFT which is in auction',
  })
  @Post('cancel-bid')
  async cancel_bid(@Body() body: CancelBidBody) {
    return await this.nftMarketplaceService.cancel_bid(body);
  }

  /*********************[ACCEPT-BID]***********************/
  @ApiOperation({ summary: 'This Api will accept a bid ' })
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

  /******************[ SALE AND OFFER ]******************************** */
  @ApiOperation({
    summary: 'This Api will put your Nft in sale with Timer',
  })
  @Post('create-sale')
  async create_sale(@Body() body: Create_Sale_Body): Promise<any> {
    const { token_owner, contract_address, token_id, price } = body;
    try {
      //is Nft Exists
      const CHECK_NFT_EXISTS = await this.nftMarketplaceService.get_Nft({
        contract_address,
        token_id,
      });
      if (!CHECK_NFT_EXISTS) {
        return 'NFT  DOESNT EXISTS';
      }
      //is Nft belongs to that owner
      if (!(CHECK_NFT_EXISTS.token_owner == token_owner)) {
        return 'You are not the Owner of this NFT';
      }
      // is in auction
      if (CHECK_NFT_EXISTS.is_in_auction) {
        return 'NFT is already in Auction';
      }
      //is already in sale
      if (CHECK_NFT_EXISTS.is_in_sale) {
        return 'NFT is already in Sale';
      }
      // All checks Completed from Db
      return await this.nftMarketplaceService.create_sale(body);
    } catch (error) {
      console.log(error);
      return {
        message:
          'Something Went Wrong , Our team is Working on please.For any queries please mail us to the below contact',
        contact: 'hello@blockatena.com',
      };
    }
  }
  @ApiOperation({ summary: 'This Api Cancels the Nft from sale' })
  @Post('cancel-sale')
  async cancel_sale(@Body() body: Cancel_Sale_Body) {
    // Add Validations
    return await this.nftMarketplaceService.cancel_sale(body);
  }
  /***************[CREATE OFFER]************************/
  @ApiOperation({
    summary: 'This Api will makes an offer to the Nft which is in sale',
  })
  @Post('create-nft-offer')
  async create_offer(@Body() body: create_Offer_Body) {
    try {
      const { sale_id, token_id, contract_address, offer_price } = body;
      // Validating sale is enough, because already sale is fully validated
      const is_sale_exists = await this.nftMarketplaceService.get_sale(sale_id);
      if (!is_sale_exists) {
        return 'sale doest exists';
      }
      if (is_sale_exists.status == 'ended') {
        return 'sale ended';
      }
      return this.nftMarketplaceService.create_offer(body);
    } catch (error) {
      console.log(error);
      return {
        message:
          'something went wrong, our team will resolve it as soon as possible ,Appreciating your patience',
      };
    }
  }
  @ApiOperation({ summary: 'This Api accepts the offer ' })
  @Post('accept-offer')
  async accept_offer(@Body() body: accept_Offer_Body) {
    //we can add validations
    const { sale_id, offer_id } = body;
    const is_sale_exists = await this.nftMarketplaceService.get_sale({
      _id: sale_id,
    });
    if (!is_sale_exists) {
      return 'NFT is not in sale';
    }
    const is_offer_exists = await this.nftMarketplaceService.get_offer({
      _id: offer_id,
    });
    if (is_offer_exists) {
      return 'Please check offer existis or not ,or please check your offer ID';
    }
    //checks over
    return await this.nftMarketplaceService.accept_offer(body);
  }
  @Post('put-for-sale-fixed-price')
  async put_sale_fixed_price() {}
  @ApiOperation({
    summary: 'This Api will get all the offers of the Nft which is in sale',
  })
  @Post('get-all-offers')
  async get_all_offers(@Body() body: get_all_offers_Body) {
    // check sale exists or not
    //  sale ended
    // accepted offer or not
    return await this.nftMarketplaceService.get_all_offers(body);
  }
  /*********************************************************/

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

  @Post('accept-offers')
  async accept_offers() {}

  // dev
  @Get('allcronjobs')
  async getallcronjobs() {
    return this.nftMarketplaceService.getCrons();
  }
  //
  // Get all collections
}

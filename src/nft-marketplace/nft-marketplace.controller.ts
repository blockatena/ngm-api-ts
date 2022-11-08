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
import {
  Acceptbid,
  CancelBidBody,
  CreateBidBody,
  GetBids,
} from './dtos/create_bid.dto';
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
  async CreateAuction(@Body() Create_Auction: CreateAuctionBody): Promise<any> {
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
      return await this.nftMarketplaceService.CreateAuction(Create_Auction);
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
  async CancelAuction(@Body() auction_id: CancelAuctionBody): Promise<any> {
    return await this.nftMarketplaceService.CancelAuction(
      auction_id.contract_address,
      auction_id.token_id,
    );
  }
  /*********************[CREATE-BID]***********************/
  @ApiOperation({
    summary: 'This Api will  Place a bid for an NFT which is in auction',
  })
  @Post('place-nft-bid')
  async CreateBid(@Body() Create_Bid: CreateBidBody) {
    //  nft_id auction id bidding price
    const {
      token_id,
      bid_amount,
      bidder_address,
      bid_expiresin,
      contract_address,
    } = Create_Bid;
    try {
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
        contract_address,
        token_id,
        status: 'started',
      });
      console.log(is_auction_exists);
      if (!is_auction_exists) {
        return 'Invalid Auction Id';
      }
      //  bid amount should be greater than min amount
      if (bid_amount < is_auction_exists.min_price) {
        return `Minium weth required for this Auction is ${is_auction_exists.min_price}`;
      }

      const is_already_bidded = await this.nftMarketplaceService.get_bid({
        bidder_address,
        contract_address,
        token_id,
        status: 'started',
      });
      console.log(is_already_bidded);
      if (is_already_bidded) {
        return 'You alread bidded for that Nft want to lower the price ?';
      }
      console.log('no problem in controller');
      return await this.nftMarketplaceService.CreateBid(Create_Bid);
    } catch (error) {
      console.log(error);
      return {
        message: 'something went wrong in controller',
      };
    }
  }
  /*********************[CANCEL-BID]***********************/
  @ApiOperation({
    summary: 'This Api will Cancel  a bid for an NFT which is in auction',
  })
  @Post('cancel-bid')
  async CancelBid(@Body() body: CancelBidBody) {
    //  write validations
    //  is nft exists
    //  is bid exists
    //  you are the rightful owner to cancel the bid or anything we need some api keys
    return await this.nftMarketplaceService.CancelBid(body);
  }

  /*********************[ACCEPT-BID]***********************/
  @ApiOperation({ summary: 'This Api will accept a bid ' })
  @Post('accept-bid')
  async accept_bid(@Body() body: Acceptbid) {
    try {
      console.log(body);
      const { contract_address, token_id, token_owner, bidder_address } = body;
      const auction_data = await this.nftMarketplaceService.get_auction({
        contract_address,
        token_id,
        token_owner,
      });
      //  validate auction
      if (!auction_data) {
        return 'Invalid Auction Id, Please check auction is present or not';
      }
      // validate Nft
      const nft_data = await this.nftMarketplaceService.get_Nft({
        token_id,
        token_owner,
      });
      if (!nft_data) {
        return 'You are not owner of the NFT';
      }
      // validate Bid

      const bid_data = await this.nftMarketplaceService.get_bid({
        token_id,
        contract_address,
        bidder_address,
      });
      if (!bid_data) {
        return 'There is no bid associated with that bid Id please check ';
      }
      //  All validations are done , now we are transferring the nft
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
  @ApiOperation({
    summary: 'This Api will get all the bids of particular Auction',
  })
  @Get('get-bids-of-auction')
  async GetBidsOfAuction(body: GetBids): Promise<any> {
    // that nft is present
    // That nft is in auction ?
    // check bids question ?
    try {
      const { contract_address, token_id } = body;
      const check_nft = await this.nftMarketplaceService.get_Nft({
        contract_address,
        token_id,
      });
      if (!check_nft) {
        return `check contract address is correct or not .May be that Nft might not be existed`;
      }
      if (!check_nft.is_in_auction) {
        return `Nft is not in Auction`;
      }
    } catch (error) {
      console.log(error);
      return {
        message: '',
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
      return await this.nftMarketplaceService.CreateSale(body);
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
  async CancelSale(@Body() body: Cancel_Sale_Body) {
    // Add Validations
    return await this.nftMarketplaceService.CancelSale(body);
  }
  /***************[CREATE OFFER]************************/
  @ApiOperation({
    summary: 'This Api will makes an offer to the Nft which is in sale',
  })
  @Post('create-nft-offer')
  async CreateOffer(@Body() body: create_Offer_Body) {
    try {
      const { sale_id, token_id, contract_address, offer_price } = body;
      // Validating sale is enough, because already sale is fully validated
      const is_sale_exists = await this.nftMarketplaceService.GetSale(sale_id);
      if (!is_sale_exists) {
        return 'sale doest exists';
      }
      if (is_sale_exists.status == 'ended') {
        return 'sale ended';
      }
      return this.nftMarketplaceService.CreateOffer(body);
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
    const is_sale_exists = await this.nftMarketplaceService.GetSale({
      _id: sale_id,
    });
    if (!is_sale_exists) {
      return 'NFT is not in sale';
    }
    const is_offer_exists = await this.nftMarketplaceService.GetOffer({
      _id: offer_id,
    });
    if (is_offer_exists) {
      return 'Please check offer existis or not ,or please check your offer ID';
    }
    //checks over
    return await this.nftMarketplaceService.AcceptOffer(body);
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
    return await this.nftMarketplaceService.GetAllOffers(body);
  }
  /*********************************************************/

  @Post('change-nft-bid-price')
  async change_bid_price() {}
  @ApiOperation({ summary: 'This Api will return all the bids of the auction' })
  @Post('get-bid-list-by-auction')
  async get_bid_list_for_auction(@Body() body: get_All_Bids): Promise<any> {
    try {
      //Auction
      return;
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

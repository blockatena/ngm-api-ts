import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  AcceptOfferBody,
  CancelOffer,
  GetAllOffersBody,
  MakeOfferBody,
} from './dtos/create_offer.dto';
import {
  CancelAuctionBody,
  CreateAuctionBody,
  GetAuction,
} from './dtos/auctiondto/create-auction.dto';
import {
  Acceptbid,
  CancelBidBody,
  CreateBidBody,
  GetBids,
} from './dtos/createbid.dto';
import { NftMarketplaceService } from './marketplace.service';
import { CancelSaleBody, CreateSaleBody } from './dtos/saledtos/createsale.dto';
import { ethers } from 'ethers';
import { ActivityService } from 'src/activity/activity.service';
import { NftService } from '../nft/nft.service';
@ApiTags('MarketPlace')
@Controller('nft-marketplace')
export class NftMarketplaceController {
  constructor(
    private readonly nftMarketplaceService: NftMarketplaceService,
    private readonly nftService: NftService,
    private readonly activityService: ActivityService,
  ) {}
  /*********************[CREATE-AUCTION]*****************/
  /*[Documentation]*/
  @ApiOperation({
    summary: ' creates an Auction for a NFT',
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully created Auction',
  })
  @ApiResponse({
    status: 400,
    description: 'Something went wrong',
  })
  /****************************[ROUTER-FUNCTION]************************/
  @Post('create-nft-auction')
  async createAuction(@Body() create_auction: CreateAuctionBody): Promise<any> {
    const { token_owner, token_id, end_date, contract_address, min_price } =
      create_auction;
    //  dis allow negative price
    if (Number(min_price) < 0) {
      return `please give a valid price`;
    }
    //
    let rawMsg = `{
      "contract_address":"${contract_address}",
      "token_id":"${token_id}",
      "token_owner":"${token_owner}",
      "start_date":"${create_auction.start_date}",
      "end_date":"${end_date}",
      "min_price":"${min_price}"
    }`;
    // with contract_address and token_id we can find an unique nft
    let hashMessage = await ethers.utils.hashMessage(rawMsg);
    let signedAddress = await ethers.utils.verifyMessage(
      `Signing to Create Auction \n${rawMsg}\n Hash : ${hashMessage}`,
      create_auction.sign,
    );
    console.log('signed Message : ', signedAddress);
    const checkCredentials = { contract_address, token_id };
    try {
      const is_nft_exists = await this.nftService.getSingleNft(
        checkCredentials,
      );
      console.log(is_nft_exists);
      if (!is_nft_exists) {
        return 'Nft doesnt exist please check details';
      }

      if (is_nft_exists.is_in_sale) {
        console.log('is in sale');
        return 'This Nft is already in  sale you cant put it in Auction ,Please Cancel that sale and try again';
      }

      if (is_nft_exists.is_in_auction) {
        console.log('is in auction');
        return 'This NFT is Already in Auction';
      }
      if (!(is_nft_exists.token_owner === token_owner)) {
        console.log('you are not owner');
        return 'You are not the owner of the NFT';
      }

      if (signedAddress !== token_owner) {
        return { message: 'Invalid User' };
      }
      //Saving in Activity.
      const activity_data = {
        event: 'List',
        item: {
          name: is_nft_exists.meta_data.name,
          contract_address,
          token_id,
          image: is_nft_exists.meta_data.image,
        },
        price: min_price,
        quantity: 1,
        from: ethers.utils.getAddress(token_owner),
        to: '----',
        read: false,
      };
      await this.activityService.createActivity(activity_data);
      return await this.nftMarketplaceService.createAuction(create_auction);
    } catch (err) {
      console.log(err);
      return 'something wrong in the system';
    }
  }

  //
  /*********************[CANCEL-AUCTION]*******************/
  @ApiOperation({
    summary: 'Cancel the Auction',
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully Cancelled the Auction',
  })
  @ApiResponse({
    status: 400,
    description: 'Something went Wrong',
  })
  @Post('cancel-auction')
  async cancelAuction(@Body() cancel_auction: CancelAuctionBody): Promise<any> {
    const { contract_address, token_id } = cancel_auction;
    let rawMsg = `{
      "contract_address":"${contract_address}",
      "token_id":"${token_id}"
    }`;

    let hashMessage = await ethers.utils.hashMessage(rawMsg);
    let signedAddress = await ethers.utils.verifyMessage(
      `Signing to Cancel Auction\n${rawMsg}\n Hash: \n${hashMessage}`,
      cancel_auction.sign,
    );
    console.log('signed Message : ', signedAddress);
    try {
      // check contract address and token id  valid or not
      // check auction is present or not
      // check auction is ended or expired or else you can check it is started or not
      // check  token_owneraddress  , because he is the owner of the token
      // if it already cancelled return "Auction is already cancelled"
      //Activity

      const is_nft_exists = await this.nftService.getSingleNft(cancel_auction);
      if (!is_nft_exists) {
        return 'nft is not exists';
      }
      if (signedAddress !== is_nft_exists.token_owner) {
        return { message: 'Invalid User' };
      }

      return await this.nftMarketplaceService.cancelAuction(
        contract_address,
        token_id,
      );
    } catch (error) {
      console.log(error);
      return {
        message: 'something went Wrong',
        error,
      };
    }
  }
  /************************[Get-Auction]***********************/
  @ApiOperation({ summary: ' will gets you ' })
  @Get('get-auction/:contract_address/:token_id/:end_date')
  async getAuction(@Param() get_auction: GetAuction): Promise<any> {
    try {
      console.log(get_auction);
      return await this.nftMarketplaceService.getAuction({ ...get_auction });
    } catch (error) {
      console.log(error);
      return {
        message: 'something went wrong',
      };
    }
  }
  /******** */
  /*********************[CREATE-BID]***********************/
  @ApiOperation({
    summary: ' will  Place a bid for an NFT which is in auction',
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully created the bid',
  })
  @ApiResponse({
    status: 400,
    description: 'Something went wrong',
  })
  @Post('place-nft-bid')
  async createBid(@Body() create_bid: CreateBidBody) {
    //  nft_id auction id bidding price
    let { token_id, bid_amount, bidder_address, contract_address } = create_bid;
    //  dis allow negative price
    if (Number(bid_amount) < 0) {
      return `please give a valid price`;
    }
    //
    bidder_address = ethers.utils.getAddress(bidder_address);
    let rawMsg = `{
      "bid_amount":"${bid_amount}",
      "bidder_address":"${bidder_address}",
    "contract_address":"${contract_address}",
    "token_id":"${token_id}"
  }`;
    let hashMessage = await ethers.utils.hashMessage(rawMsg);
    let signedAddress = await ethers.utils.verifyMessage(
      `Signing to Place Bid\n${rawMsg}\n Hash: \n${hashMessage}`,
      create_bid.sign,
    );
    console.log('signed Message : ', signedAddress);
    try {
      const is_nft_exists = await this.nftService.getSingleNft({
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
      const is_auction_exists = await this.nftMarketplaceService.getAuction({
        contract_address,
        token_id,
        status: 'started',
      });
      console.log(is_auction_exists);
      if (!is_auction_exists) {
        return 'Invalid Auction Id';
      }
      //Check if Signer
      if (signedAddress !== bidder_address) {
        return { message: 'Invalid User' };
      }
      //if the person is already bidded or not
      const is_already_bidded = await this.nftMarketplaceService.getBid({
        auction_id: is_auction_exists._id,
        bidder_address,
        contract_address,
        token_id,
        status: 'started',
      });
      console.log(is_already_bidded);
      create_bid['auction_id'] = is_auction_exists?._id;
      console.log('no problem in controller');

      const activity = {
        event: is_already_bidded ? 'Update Bid' : 'Place Bid',
        item: {
          name: is_nft_exists.meta_data.name,
          contract_address,
          token_id,
          image: is_nft_exists.meta_data.image,
        },
        price: bid_amount,
        quantity: 1,
        from: ethers.utils.getAddress(bidder_address),
        to: '----',
        read: false,
      };
      const activityResponce = await this.activityService.createActivity(
        activity,
      );
      console.log('Activity : ', activityResponce);
      if (is_already_bidded) {
        return await this.nftMarketplaceService.updateBid(
          {
            bidder_address,
            auction_id: is_auction_exists?._id,
            status: 'started',
          },
          create_bid,
        );
      } else {
        return await this.nftMarketplaceService.createBid({
          auction_id: is_auction_exists._id,
          bidder_address,
          contract_address,
          token_id,
          bid_amount,
        });
      }
    } catch (error) {
      console.log(error);
      return {
        message: 'something went wrong in controller',
      };
    }
  }
  /*********************[CANCEL-BID]***********************/
  @ApiOperation({
    summary: ' will Cancel  a bid for an NFT which is in auction',
  })
  @ApiResponse({
    status: 201,
    description: 'The bid is cancelled for the NFT',
  })
  @ApiResponse({
    status: 400,
    description: 'Something went wrong',
  })
  @Post('cancel-bid')
  async cancelBid(@Body() body: CancelBidBody) {
    //  write validations
    //  is nft exists
    //  is bid exists
    //  you are the rightful owner to cancel the bid or anything we need some api keys
    const { contract_address, token_id, bidder_address } = body;
    let rawMsg = `{
      "bidder_address":"${bidder_address}",
    "contract_address":"${contract_address}",
    "token_id":"${token_id}"
  }`;
    let hashMessage = await ethers.utils.hashMessage(rawMsg);
    let signedAddress = await ethers.utils.verifyMessage(
      `Signing to Cancel Bid\n${rawMsg}\n Hash: \n${hashMessage}`,
      body.sign,
    );
    console.log('signed Message : ', signedAddress);
    try {
      // is nft exists
      const is_nft_exists = await this.nftService.getSingleNft({
        token_id,
        contract_address,
      });
      console.log('nft exist : ', is_nft_exists);
      //is auction exists
      const is_auction_exists = await this.nftMarketplaceService.getAuction({
        contract_address,
        token_id,
        status: 'started',
      });
      console.log('existed   :  ', is_auction_exists);
      if (!is_auction_exists) {
        return 'Invalid Auction Id';
      }
      //Check if Signer
      if (signedAddress !== bidder_address) {
        return { message: 'Invalid User' };
      }
      const is_bid_exits = await this.nftMarketplaceService.getBid({
        auction_id: is_auction_exists._id,
        bidder_address,
        contract_address,
        token_id,
        status: 'started',
      });

      console.log('bid existed   :  ', is_bid_exits);
      // is bid exists
      if (!is_bid_exits) {
        return 'No bid found';
      }
      const activity = {
        event: 'Cancel Bid',
        item: {
          name: is_nft_exists.meta_data.name,
          contract_address,
          token_id,
          image: is_nft_exists.meta_data.image,
        },
        price: is_bid_exits.bid_amount,
        quantity: 1,
        from: ethers.utils.getAddress(bidder_address),
        to: '----',
        read: false,
      };
      const activity_response = await this.activityService.createActivity(
        activity,
      );
      console.log('activity  : ', activity_response);
      return await this.nftMarketplaceService.cancelBid(body);
    } catch (error) {
      console.log(error);
      return {
        message: 'something went wrong',
        error,
      };
    }
  }

  /*********************[ACCEPT-BID]***********************/
  @ApiOperation({ summary: ' will accept a bid ' })
  @ApiResponse({
    status: 201,
    description: 'This Bid is acccepted',
  })
  @ApiResponse({ status: 400, description: 'Something went wrong' })
  @Post('accept-bid')
  async acceptBid(@Body() body: Acceptbid) {
    try {
      const { auction_id } = body;
      const auctionDetails = await this.nftMarketplaceService.getAuction({
        _id: auction_id,
      });
      if (!auctionDetails) {
        return 'Invalid Auction Id';
      }
      const bidWinner = await this.nftMarketplaceService.declareWinner({
        _id: auctionDetails._id.toString(),
        token_id: auctionDetails.token_id,
        contract_address: auctionDetails.contract_address,
        token_owner: auctionDetails.token_owner,
      });
      console.log(bidWinner);

      return {
        message: 'Bid accepted and transferred the ownership of the NFT',
        status: bidWinner,
      };
    } catch (error) {
      console.error(error);
      return {
        messge: 'something went wrong ,Please wait our team is working on it',
      };
    }
  }
  @ApiOperation({
    summary: ' will get all the bids of particular Auction',
  })
  @Get('get-bids-of-auction')
  async getBidsOfAuction(body: GetBids): Promise<any> {
    // that nft is present
    // That nft is in auction ?
    // check bids question ?
    try {
      const { contract_address, token_id } = body;
      const check_nft = await this.nftService.getSingleNft({
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
  /******************[SALE_AND_OFFER]******************************** */
  @ApiOperation({
    summary: ' will put your Nft in sale with Timer',
  })
  @Post('create-sale')
  async createSale(@Body() body: CreateSaleBody): Promise<any> {
    const { token_owner, contract_address, token_id, price } = body;
    //  dis allow negative price
    if (Number(price) < 0) {
      return `please give a valid price`;
    }
    //
    let rawMsg = `{
      "contract_address":"${contract_address}",
      "token_id":"${token_id}",
      "token_owner":"${token_owner}",
      "start_date":"${body.start_date}",
      "end_date":"${body.end_date}",
      "price":"${body.price}"
    }`;
    console.log(rawMsg);
    let hashMessage = await ethers.utils.hashMessage(rawMsg);
    let signedAddress = await ethers.utils.verifyMessage(
      `Signing to Create Sale \n${rawMsg}\n Hash : ${hashMessage}`,
      body.sign,
    );
    console.log('signed Message : ', signedAddress);
    try {
      //is Nft Exists
      const check_nft_exists = await this.nftService.getSingleNft({
        contract_address,
        token_id,
      });
      if (!check_nft_exists) {
        return 'NFT  DOESNT EXISTS';
      }
      //is Nft belongs to that owner
      if (!(check_nft_exists.token_owner == token_owner)) {
        return 'You are not the Owner of this NFT';
      }
      if (signedAddress !== token_owner) {
        return { message: 'Invalid User' };
      }
      // is in auction
      if (check_nft_exists.is_in_auction) {
        return 'NFT is already in Auction';
      }
      //is already in sale
      if (check_nft_exists.is_in_sale) {
        return 'NFT is already in Sale';
      }
      // All checks Completed from Db
      return await this.nftMarketplaceService.createSale(body);
    } catch (error) {
      console.log(error);
      return {
        message:
          'Something Went Wrong , Our team is Working on please.For any queries please mail us to the below contact',
        contact: 'hello@blockatena.com',
      };
    }
  }
  @ApiOperation({ summary: ' Cancels the Nft from sale' })
  @Post('cancel-sale')
  async cancelSale(@Body() body: CancelSaleBody): Promise<any> {
    // Add Validations
    let rawMsg = `{
      "contract_address":"${body.contract_address}",
      "token_id":"${body.token_id}"
  }`;
    let hashMessage = await ethers.utils.hashMessage(rawMsg);
    let signedAddress = await ethers.utils.verifyMessage(
      `Signing to Cancel Sale\n${rawMsg}\n Hash: \n${hashMessage}`,
      body.sign,
    );
    console.log('signed Message : ', signedAddress);
    try {
      const nft = await this.nftService.getSingleNft({
        contract_address: body.contract_address,
        token_id: body.token_id,
      });
      if (signedAddress !== nft.token_owner) {
        return { message: 'Invalid User' };
      }
      return await this.nftMarketplaceService.cancelSale(body);
    } catch (error) {
      console.log(error);
      return {
        message: 'something went wrong',
        error,
      };
    }
  }
  /***************[MAKE_OFFER_TO_NFT]************************/
  @ApiOperation({
    summary: ' will makes an offer to the Nft which is in sale',
  })
  @Post('make-offer-to-nft')
  async makeOffer(@Body() body: MakeOfferBody) {
    try {
      const { token_id, contract_address, offer_person_address, offer_price } =
        body;
      //  dis allow negative price
      if (Number(offer_price) < 0) {
        return `please give a valid price`;
      }

      let rawMsg = `{
      "offer_price":"${offer_price}",
      "offer_person_address":"${offer_person_address}",
    "contract_address":"${contract_address}",
    "token_id":"${token_id}"
  }`;
      let hashMessage = await ethers.utils.hashMessage(rawMsg);
      let signedAddress = await ethers.utils.verifyMessage(
        `Signing to Make Offer\n${rawMsg}\n Hash: \n${hashMessage}`,
        body.sign,
      );
      console.log('signed Message : ', signedAddress);
      // Validating sale is enough, because already sale is fully validated
      const check_nft_exists = await this.nftService.getSingleNft({
        contract_address,
        token_id,
      });
      if (!check_nft_exists) {
        return 'nft doesnt exists';
      }
      const is_sale_exists = await this.nftMarketplaceService.getSale({
        token_id,
        contract_address,
        status: 'started',
      });
      if (!is_sale_exists) {
        return 'sale doest exists';
      }
      if (is_sale_exists.status !== 'started') {
        return `sale  ${is_sale_exists.status}`;
      }
      //Check if Signer
      if (signedAddress !== offer_person_address) {
        return { message: 'Invalid User' };
      }
      body[`sale_id`] = is_sale_exists._id;
      const is_user_already_offer: any =
        await this.nftMarketplaceService.getOfferData({
          offer_person_address,
          sale_id: is_sale_exists._id,
          offer_status: 'started',
        });
      console.log(is_user_already_offer);

      //activity
      const activity = {
        event: is_user_already_offer ? 'Update Offer' : 'Make Offer',
        item: {
          name: check_nft_exists.meta_data.name,
          contract_address,
          token_id,
          image: check_nft_exists.meta_data.image,
        },
        price: offer_price,
        quantity: 1,
        from: ethers.utils.getAddress(offer_person_address),
        to: '----',
        read: false,
      };
      const activity_response = await this.activityService.createActivity(
        activity,
      );
      console.log(activity_response);

      if (is_user_already_offer) {
        return await this.nftMarketplaceService.updateOffer(
          {
            offer_person_address,
            sale_id: is_sale_exists._id,
            offer_status: 'started',
          },
          body,
        );
      } else {
        return this.nftMarketplaceService.makeOffer(body);
      }
    } catch (error) {
      console.log(error);
      return {
        message:
          'something went wrong, our team will resolve it as soon as possible ,Appreciating your patience',
      };
    }
  }
  @ApiOperation({ summary: ' accepts the offer ' })
  @Post('accept-offer')
  async acceptOffer(@Body() body: AcceptOfferBody) {
    //we can add validations
    const { contract_address, token_id, offer_person_address, token_owner } =
      body;
    let rawMsg = `{
      "contract_address":"${contract_address}",
      "token_id":"${token_id}",
      "offer_person_address":"${offer_person_address}",
      "token_owner":"${token_owner}"
  }`;
    let hashMessage = ethers.utils.hashMessage(rawMsg);
    let signedAddress = ethers.utils.verifyMessage(
      `Signing to Accept Offer\n${rawMsg}\n Hash: \n${hashMessage}`,
      body.sign,
    );
    console.log('signed Message : ', signedAddress);
    const checkCredentials = {
      contract_address: body.contract_address,
      token_id: body.token_id,
    };
    if (signedAddress !== token_owner) {
      return { message: 'Invalid User' };
    }
    return await this.nftMarketplaceService.acceptOffer(body);
  }

  @ApiOperation({ summary: ' Cancels the offer' })
  @Post('cancel-offer')
  async cancelOffer(@Body() body: CancelOffer): Promise<any> {
    const { contract_address, token_id, offer_person_address, caller } = body;
    let rawMsg = `{
      "offer_person_address":"${offer_person_address}",
    "contract_address":"${contract_address}",
    "token_id":"${token_id}",
    "caller":"${caller}"
  }`;
    let hashMessage = await ethers.utils.hashMessage(rawMsg);
    let signedAddress = await ethers.utils.verifyMessage(
      `Signing to Cancel Offer\n${rawMsg}\n Hash: \n${hashMessage}`,
      body.sign,
    );
    console.log('signed Message : ', signedAddress);
    const checkCredentials = { contract_address, token_id };
    try {
      //Check if Signer
      const is_nft_exists = await this.nftService.getSingleNft(
        checkCredentials,
      );
      if (
        signedAddress !== offer_person_address &&
        signedAddress !== is_nft_exists.token_owner
      ) {
        return { message: 'Invalid User' };
      }
      return await this.nftMarketplaceService.cancelOffer(body);
    } catch (error) {
      console.log(error);
      return {
        message: 'something went wrong',
        error,
      };
    }
  }
  // @Post('put-for-sale-fixed-price')
  // async putSaleFixedPrice() {}
  @ApiOperation({
    summary: 'under Progress',
  })
  @Post('get-all-offers')
  async getAllOffers(@Body() body: GetAllOffersBody) {
    // check sale exists or not
    //  sale ended
    // accepted offer or not
    return await this.nftMarketplaceService.getAllOffers(body);
  }
  /*********************************************************/

  // @Post('change-nft-bid-price')
  // async changeBidPrice() {}
  // @ApiOperation({ summary: ' will return all the bids of the auction' })
  // @Post('get-bid-list-by-auction')
  // async getBidListForAuction(@Body() body: GetAllBids): Promise<any> {
  //   try {
  //     //Auction
  //     return ``;
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }
  // @Get('test')
  // async test(): Promise<any> {
  //   return await this.nftMarketplaceService.addvolume();
  // }

  //fix

  // activityfix
  @Post('fix')
  async activityfix(): Promise<any> {
    try {
      await this.nftMarketplaceService.activityfix();
    } catch (error) {
      console.log(error);
      return {
        succcess: false,
        message: 'something went wrong',
        error,
      };
    }
  }
}

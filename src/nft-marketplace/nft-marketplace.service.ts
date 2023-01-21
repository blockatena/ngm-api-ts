import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateAuctionBody } from './dtos/auctiondto/create-auction.dto';
import {
  CancelBidBody,
  CreateBidBody,
  GetBids,
  updateAllBidsBody,
} from './dtos/create_bid.dto';
import { ContractDocument, ContractSchema } from 'src/schemas/contract.schema';
import {
  CancelSaleBody,
  CreateSaleBody,
} from './dtos/saledtos/create-sale.dto';
import {
  AcceptOfferBody,
  CancelOffer,
  GetAllOffersBody,
  MakeOfferBody,
} from './dtos/create_offer.dto';
import { abi as marketplaceAbi } from 'src/utils/constants/MARKETPLACE/marketplace.abi';
import { ethers } from 'ethers';
import { NftService } from 'src/nft/nft.service';
import { ConfigService } from '@nestjs/config';
import { AuctionSchema, AuctionDocument } from 'src/schemas/auction.schema';
import { BidSchema, BidDocument } from 'src/schemas/bid.schema';
import { OfferSchema, OfferDocument } from 'src/schemas/offer.schema';
import { SalesSchema, SalesDocument } from 'src/schemas/sales.schema';
import { ActivityService } from 'src/activity/activity.service';
import { TradeVolume } from './dtos/trade-volume.dto';
import { Offer1155Schema, Offer1155Document } from 'src/schemas/offer1155.schema';
import { Sale1155Schema, Sale1155Document } from 'src/schemas/sale1155.schema';
import { G2W3_1155Sale, G2W3_1155Offer, G2W3_1155AcceptOffer} from './dtos/auctiondto/create-1155-auction.dto'
import { check } from 'prettier';
@Injectable()
export class NftMarketplaceService {
  constructor(
    private activityService: ActivityService,
    private configService: ConfigService,
    private nftService: NftService,
    @InjectModel(ContractSchema.name)
    private ContractModel: Model<ContractDocument>,
    @InjectModel(AuctionSchema.name)
    private AuctionModel: Model<AuctionDocument>,
    @InjectModel(BidSchema.name) private BidModel: Model<BidDocument>,
    @InjectModel(SalesSchema.name) private SalesModel: Model<SalesDocument>,
    @InjectModel(OfferSchema.name) private OfferModel: Model<OfferDocument>,
    @InjectModel(Offer1155Schema.name) private Offer1155Model: Model<Offer1155Document>,
    @InjectModel(Sale1155Schema.name) private Sale1155Model: Model<Sale1155Document>
  ) {
    AuctionModel;
    BidModel;
    ContractModel;
    SalesModel;
    OfferModel;
  }
  private MATIC_MUMBAI_RPC_URL = this.configService.get<string>(
    'MATIC_MUMBAI_RPC_URL',
  );
  private PRIV_KEY = this.configService.get<string>('PRIV_KEY');

  //global
  private mum_provider = new ethers.providers.JsonRpcProvider(
    process.env.MATIC_MUMBAI_RPC_URL,
  );
  private wallet = new ethers.Wallet(this.PRIV_KEY, this.mum_provider);

  /*********************[AUCTION-SERVICES]**********************/
  async createAuction(createAuction: CreateAuctionBody): Promise<any> {
    const { contract_address, token_id } = createAuction;
    try {
      // updating nft status in auction
      await this.nftService.updateNft(
        {
          contract_address: createAuction.contract_address,
          token_id: createAuction.token_id,
        },
        { is_in_auction: true },
      );
      const data = await this.AuctionModel.create(createAuction);
      console.log('Auction Created', data);
      return data;
    } catch (error) {
      console.log(error);
      /* if anything goes wrong we need to revert back to earlier status */
      return {
        message: 'something went wrong',
      };
    }
  }
  /*********[CANCEL-AUCTION-SERVICE]*******/
  async cancelAuction(
    contract_address: string,
    token_id: string,
  ): Promise<any> {
    console.log('auction_id', contract_address, token_id);
    try {
      // Getting Auction
      const auction_data = await this.getAuction({
        contract_address,
        token_id,
        status: 'started',
        // need to add one more ,which is date
      });
      // Updating Nft
      const update_nft = await this.nftService.updateNft(
        {
          contract_address: auction_data.contract_address,
          token_id: auction_data.token_id,
        },
        { is_in_auction: false },
      );
      // updating Auction
      const success_data = await this.updateAuction(
        {
          _id: auction_data._id,
          contract_address,
          token_id,
          status: 'started',
        },
        { status: 'cancelled' },
      );

      //update in all bids
      await this.updateAllBids(
        {
          contract_address,
          token_id,
          status: 'started',
        },
        { status: 'CancelledByAuctionOwner' },
      );
      // creating activity object
      const activity = {
        event: 'Cancel List',
        item: {
          name: update_nft.meta_data.name,
          contract_address,
          token_id,
          image: update_nft.meta_data.image,
        },
        price: auction_data.min_price,
        quantity: 1,
        from: auction_data.token_owner,
        to: '----',
        read: false,
      };
      await this.activityService.createActivity(activity);
      return { success_data, message: 'Successfully deleted' };
    } catch (error) {
      console.log(error);
      return {
        message:
          'something went wrong ,our team is working on it.For any Queries you  can contact us to our official mail',
        contact: 'hello@blockatena.com',
      };
    }
  }

  /*[Getting All Auctions]*/
  async getAllAuctions(): Promise<any> {
    return await this.AuctionModel.find({ status: 'started' });
  }
  /************************************/
  /****************[BID_SERVICES]*************/
  async createBid(createBid: object): Promise<any> {
    try {
      console.log(createBid);
      const data = await this.BidModel.create(createBid);
      return data;
    } catch (error) {
      console.log(error);
    }
  }
  /**********[CANCEL-BID-SERVICE]*********/
  async cancelBid(bid_data: CancelBidBody): Promise<any> {
    const { contract_address, bidder_address, token_id } = bid_data;
    try {
      const message = await this.updateBid(
        { contract_address, bidder_address, token_id, status: 'started' },
        { status: 'cancelled' },
      );
      return {
        message,
      };
    } catch (error) {
      console.log(error);
      return {
        message:
          'something went wrong ,our team is working on it.For any Queries you  can contact us to our official mail',
        contact: 'hello@blockatena.com',
      };
    }
  }
  /************[GET BIDS FOR AUCTION]**********/
  async getBidsForAuction(bid: GetBids): Promise<any> {
    try {
      const { contract_address, token_id } = bid;
      const bid_data = await this.BidModel.find({ contract_address, token_id });
      return bid_data;
    } catch (error) {
      console.log(error);
      return {
        message: 'something went wrong',
        error,
      };
    }
  }
  /*********************[UPDATE_A_SINGLE_BID]**************************/
  // This route is used to cancel the bid
  async updateBid(condition: Object, values: Object): Promise<any> {
    try {
      return await this.BidModel.updateOne(condition, values);
    } catch (error) {
      return { message: 'something went wrong', error: error };
    }
  }
  /************[UPDATE_ALL_BIDS_FOR_A_PARTICULAR_AUCTION]*************/
  // After cancelling the Auction by user or after expiring the auction we need to call this
  async updateAllBids(condition: Object, values: Object): Promise<any> {
    try {
      return await this.BidModel.updateMany(condition, values);
    } catch (error) {
      return { message: 'something went wrong', error: error };
    }
  }

  /****************[END_OF_BID_SERVICE]***********/
  /************************************************/
  /******************[CREATE_SALE]**************/
  async createSale(sale: CreateSaleBody): Promise<any> {
    const { contract_address, token_id, token_owner, price } = sale;
    try {
      // save in DB
      const save_in_db = await this.SalesModel.create(sale);
      //update in nft is in auction is true
      const update_nft = await this.nftService.updateNft(
        { contract_address, token_id },
        { is_in_sale: true },
      );
      // creating Activity
      const activity = {
        event: 'Sale',
        item: {
          name: update_nft.meta_data.name,
          contract_address,
          token_id,
          image: update_nft.meta_data.image,
        },
        price: price,
        quantity: 1,
        from: token_owner,
        to: '----',
        read: false,
      };
      await this.activityService.createActivity(activity);
      return save_in_db;
    } catch (error) {
      console.log(error);
      return { message: 'something wrong in DB' };
    }
  }
  /********************[CANCEL_SALE]***********************/
  async cancelSale(cancel: CancelSaleBody): Promise<any> {
    const { contract_address, token_id } = cancel;
    try {
      //update status of the sale

      // offers schema needs to be updated
      // ********
      //
      const sale = await this.SalesModel.findOne({
        contract_address,
        token_id,
        status: 'started',
      });
      console.log('sale', sale);
      if (!sale) {
        return 'sale doesnt exists';
      }
      const update_nft = await this.nftService.updateNft(
        {
          contract_address,
          token_id,
        },
        { is_in_sale: false },
      );
      // console.log(update_nft);
      //Update All offers
      const update_all_offers = await this.updateAllOffers(
        { sale_id: sale._id },
        { status: 'cancelled' },
      );
      //
      // Activity
      console.log(update_nft);
      const activity = {
        event: 'Cancel Sale',
        item: {
          name: update_nft.meta_data.name,
          contract_address,
          token_id,
          image: update_nft.meta_data.image,
        },
        price: sale.price,
        quantity: 1,
        from: sale.token_owner,
        to: '----',
        read: false,
      };
      // console.log(update_nft);
      const activity_response = await this.activityService.createActivity(
        activity,
      );
      // console.log(update_nft);
      await this.updateSale(
        {
          contract_address,
          token_id,
          status: 'started',
        },
        { status: 'cancelled' },
      );
      // console.log(activity_response);
      return activity_response;
    } catch (error) {
      console.log(error);
      return { message: 'something wrong in DB or with Cron Jobs' };
    }
  }
  //CRUD for sale schema
  async getSale(saleData: any): Promise<any> {
    try {
      return await this.SalesModel.findOne(saleData);
    } catch (error) {
      console.log(error);
      return { message: 'something went wrong' };
    }
  }
  /************************[GET_OFFER]**************************/
  async getOfferData(offerData: any): Promise<any> {
    try {
      return await this.OfferModel.findOne(offerData);
    } catch (error) {
      console.log(error);
      return { message: 'something went wrong' };
    }
  }
  async updateSale(data: any, update_data: any): Promise<any> {
    try {
      await this.SalesModel.findOneAndUpdate(data, { $set: update_data });
    } catch (error) {
      console.log(error);
      return {
        message: 'something went wrong',
        error,
      };
    }
  }

  /********[MAKE-OFFER]*******/
  async makeOffer(offer: MakeOfferBody): Promise<any> {
    const { contract_address, token_id, offer_person_address } = offer;
    try {
      return await this.OfferModel.create(offer);
    } catch (error) {
      console.log(error);
      return {
        message: 'Somethign went wrong',
      };
    }
  }
  /************************[ACCEPT_OFFER]*************************/
  async acceptOffer(accept_Data: AcceptOfferBody): Promise<any> {
    const { contract_address, token_id, token_owner, offer_person_address } =
      accept_Data;
    try {
      const getSale = await this.SalesModel.findOne({
        contract_address,
        token_id,
        status: 'started',
      });
      if (!getSale) {
        return 'NFT is not in sale';
      }
      // console.log('getsale', getSale);
      if (!(getSale.token_owner == token_owner)) {
        return 'You are not the owner of this nft';
      }
      //Get Offer details
      const offer_details = await this.OfferModel.findOne({
        sale_id: getSale._id,
        offer_person_address,
        contract_address,
        token_id,
        offer_status: 'started'
      });
      console.log('getsale', offer_details);
      if (!offer_details) {
        return 'offer doesnt exists';
      }
      //console.log("Both offer and sale exists");
      const marketplaceAddress = process.env.MARKETPLACE_CONTRACT_ADDRESS;
      const erc20Address = process.env.ERC20_TOKEN_ADDRESS;
      //ethers code contractFactory
      const marketplaceCntr = new ethers.Contract(
        marketplaceAddress,
        marketplaceAbi,
        this.wallet,
      );
      // Get the contract details
      const nftCntr = await this.ContractModel.findOne({
        contract_address,
      });
      // console.log("contract address", nftCntr)
      // Get sale details
      // calling to block-chain
      const feeData = await this.mum_provider.getFeeData()
      console.log('offer price', offer_details.offer_price);
      const price = ethers.utils.parseUnits(offer_details.offer_price, 'ether');

      const createSale = await marketplaceCntr.createSale(
        erc20Address,
        contract_address,
        offer_person_address,
        parseInt(token_id),
        token_owner,
        nftCntr.owner_address,
        price,
        { gasPrice: feeData.gasPrice }
      );
      const transaction_hash = createSale.hash;
      console.log(transaction_hash);
      // waiting to complete the process in block chain
      const res = await createSale.wait();
      if (!res) {
        return false;
      }
      console.log('createSale', createSale);
      console.log('www', res);
      //  get nft 
      const nft = await this.nftService.getSingleNft({ contract_address, token_id });
      //Make changes in our Db
      if (Number(offer_details.offer_price) > Number(nft.price)) {
        await this.nftService.updateNft(
          { contract_address, token_id },
          {
            token_owner: offer_person_address,
            price: offer_details.offer_price,
            is_in_sale: false,
            highest_price: offer_details.offer_price
          },
        );
      }
      else {
        await this.nftService.updateNft(
          { contract_address, token_id },
          {
            token_owner: offer_person_address,
            price: offer_details.offer_price,
            is_in_sale: false
          },
        );
      }
      // validate Nft
      const nft_data = await this.nftService.getSingleNft({
        token_id,
        contract_address,
        token_owner: ethers.utils.getAddress(offer_person_address),
      });
      if (!nft_data) {
        return 'You are not owner of the NFT';
      }
      //
      await this.updateSale(
        { contract_address, token_id, status: 'started' },
        { status: 'ended' },
      );
      //updating remaining offers
      await this.updateAllOffers(
        { sale_id: getSale._id, status: 'started' },
        { status: 'ended' },
      );
      //updating offer
      const offer_msg = await this.updateOffer(
        { sale_id: getSale._id, offer_person_address },
        { offer_status: 'accepted' },
      );
      //
      const activity1 = {
        event: 'Offer Accepted',
        item: {
          name: nft_data.meta_data.name,
          contract_address,
          token_id,
          image: nft_data.meta_data.image,
        },
        price: offer_details.offer_price,
        quantity: 1,
        transaction_hash,
        from: ethers.utils.getAddress(token_owner),
        to: ethers.utils.getAddress(offer_person_address),
        read: false,
      };
      await this.activityService.createActivity(activity1);
      //
      // Adding Activity
      const activity2 = {
        event: 'Transfer',
        item: {
          name: nft_data.meta_data.name,
          contract_address,
          token_id,
          image: nft_data.meta_data.image,
        },
        price: offer_details.offer_price,
        quantity: 1,
        transaction_hash: transaction_hash,
        from: ethers.utils.getAddress(token_owner),
        to: ethers.utils.getAddress(offer_person_address),
        read: false,
      };
      // adding Trade Volume
      await this.tradeVolume({ contract_address, price: offer_details.offer_price });
      return await this.activityService.createActivity(activity2);
    } catch (error) {
      console.log(error);
      return {
        message: 'Something went Wrong in DB',
        status: 'Our Team is looking into it ',
      };
    }
  }
  /*************************[UPDATE_ALL_OFFERS]*********************/
  async updateAllOffers(condition: any, update: any): Promise<any> {
    try {
      return await this.OfferModel.updateMany(condition, { $set: update });
    } catch (error) {
      return {
        message: 'something went Wrong',
        error,
      };
    }
  }
  /********************[GET_OFFER]*****************************/
  async getOffer(offer_Data: any): Promise<any> {
    try {
      return await this.OfferModel.findOne(offer_Data);
    } catch (error) {
      console.log(error);
      return {
        message: 'Something went Wrong in DB',
        status: 'Our Team is looking into it ',
      };
    }
  }
  /*********************[GET_ALL_OFFERS]************************/
  async getAllOffers(saleData: GetAllOffersBody) {
    try {
      return await this.OfferModel.find({
        sale_id: saleData.sale_id,
        offer_status: 'started',
      }).sort({ offer_price: -1, createdAt: -1 });
    } catch (error) {
      console.log(error);
      return {
        message: 'something went wrong',
        error,
      };
    }
  }
  /***********************[UPDATE_OFFER]*************************/
  async updateOffer(offer_data: Object, update_data: Object) {
    try {
      return await this.OfferModel.findOneAndUpdate(offer_data, {
        $set: update_data,
      });
    } catch (error) {
      console.log(error);
      return {
        message: 'something went wrong',
        error,
      };
    }
  }
  /************************[CANCEL_OFFER]********************************/
  async cancelOffer(body: CancelOffer): Promise<any> {
    const { contract_address, token_id, offer_person_address, caller } = body;
    try {
      const is_nft_exists = await this.nftService.getSingleNft({
        contract_address,
        token_id,
      });
      const is_sale_exists = await this.getSale({
        token_id,
        contract_address,
        status: 'started',
      });
      body['sale_id'] = is_sale_exists._id;
      body['offer_status'] = 'started';
      const is_offer_exists = await this.getOffer({
        sale_id: is_sale_exists._id,
        offer_person_address,
      });
      if (!is_offer_exists) {
        return 'offer doesnt exists';
      }
      const activity = {
        event: 'Cancel Offer',
        item: {
          name: is_nft_exists.meta_data.name,
          contract_address,
          token_id,
          image: is_nft_exists.meta_data.image,
        },
        price: is_offer_exists.offer_price,
        quantity: 1,
        from: ethers.utils.getAddress(caller),
        to: '----',
        read: false,
      };
      await this.activityService.createActivity(activity);
      return await this.updateOffer(body, { offer_status: 'cancelled' });
    } catch (error) {
      console.log(error);
      return {
        message: 'something went wrong',
        error,
      };
    }
  }
  /**********************[DECLARE_WINNER]*****************************/
  async declareWinner(auction_details: any): Promise<any> {
    //currently its a demo version need to add actual functionality later
    try {
      //We are declaring the winner here
      const data = await this.BidModel.find({
        auction_id: auction_details._id,
        status: 'started',
      })
        .sort({ bid_amount: -1, created_at: -1 })
        .limit(1);
      console.log('data from winner function', data);
      const contract_address = auction_details.contract_address;
      const token_id = auction_details.token_id;
      //update in all bids
      // console.log('*************');
      console.log('All_bidsdata', data);
      // console.log('*************');
      //
      // Getting Nft
      const tokenDetails = await this.nftService.getSingleNft({
        contract_address: auction_details.contract_address,
        token_id: auction_details.token_id,
      });
      if (data.length) {
        const nftContractAddress = data[0]['contract_address'];
        //  Getting Contract Details
        const nftCntr = await this.ContractModel.findOne({
          contract_address: nftContractAddress,
        });
        console.log('got contract', nftCntr);
        // console.log("got tokendetials", tokenDetails)
        const token_owner = tokenDetails.token_owner;

        const marketplaceAddress = process.env.MARKETPLACE_CONTRACT_ADDRESS;
        const erc20Address = process.env.ERC20_TOKEN_ADDRESS;
        //ethers code contractFactory
        const marketplaceCntr = new ethers.Contract(
          marketplaceAddress,
          marketplaceAbi,
          this.wallet,
        );
        console.log("bidamount", data[0].bid_amount)
        const price = data[0].bid_amount;
        console.log('price = ', price);
        const bidder_address = data[0]['bidder_address'];
        const bid_amount = ethers.utils.parseUnits(price, 'ether');
        console.log(
          '\nbidder address',
          bidder_address,
          '\nbid amount',
          bid_amount,
          '\ntoken owner',
          token_owner,
          '\ntoken id',
          token_id,
          '\ncontract address',
          contract_address,
          '\nerc20 address',
          erc20Address,
          '\ncontract owner address',
          nftCntr.owner_address,
        );
        const feeData = await this.mum_provider.getFeeData()
        const create_Sale = await marketplaceCntr.createSale(
          erc20Address,
          contract_address,
          bidder_address,
          parseInt(token_id),
          token_owner,
          nftCntr.owner_address,
          bid_amount,
          { gasPrice: feeData.gasPrice }
        );
        console.log('sale', create_Sale);
        const transaction_hash = create_Sale.hash;
        console.log('transaction_hash', transaction_hash);
        const res = await create_Sale.wait();
        console.log('res from create sale', res);
        if (!res) {
          return false;
        }
        if (Number(price) > Number(tokenDetails.price)) {
          const update_nft = await this.nftService.updateNft(
            {
              contract_address: tokenDetails.contract_address,
              token_id: tokenDetails.token_id,
            },
            {
              token_owner: bidder_address,
              is_in_auction: false,
              price: price,
              highest_price: price
            },
          );
        } else {
          const update_nft = await this.nftService.updateNft(
            {
              contract_address: tokenDetails.contract_address,
              token_id: tokenDetails.token_id,
            },
            {
              token_owner: bidder_address,
              is_in_auction: false,
              price: price,
            },
          );
        }
        const nft_data = await this.nftService.getSingleNft({
          contract_address,
          token_id,
          token_owner: bidder_address,
        });
        if (!nft_data) {
          return 'You are not owner of the NFT';
        }
        await this.updateAllBids(
          {
            contract_address,
            token_id,
            status: 'started',
          },
          { status: 'AuctionExpired', is_auction_ended: true },
        );

        // creating activity
        const activity1 = {
          event: 'Won',
          item: {
            name: tokenDetails.meta_data.name,
            contract_address,
            token_id,
            image: tokenDetails.meta_data.image,
          },
          price: price,
          quantity: 1,
          transaction_hash,
          from: ethers.utils.getAddress(token_owner),
          to: bidder_address,
          read: false,
        };
        console.log(activity1);

        // Adding activity
        const activity2 = {
          event: 'Transfer',
          item: {
            name: tokenDetails.meta_data.name,
            contract_address,
            token_id,
            image: tokenDetails.meta_data.image,
          },
          price: price,
          quantity: 1,
          transaction_hash,
          from: ethers.utils.getAddress(token_owner),
          to: bidder_address,
          read: false,
        };
        console.log(activity2);

        await this.activityService.createActivity(activity1);
        await this.activityService.createActivity(activity2);

        // console.log(update_nft);
        // checking the owner whether the NFT is transferred suceessfully or not
        const winner_data = bidder_address || 'nobids';
        // Updating the Auction
        const auction = await this.updateAuction(
          {
            contract_address: contract_address,
            token_id: token_id,
            status: 'started',
          },
          { status: 'expired', winner: winner_data },
        );
        console.log(auction);
        return data;
      }
      // updating the nft details
      await this.nftService.updateNft(
        {
          contract_address: tokenDetails.contract_address,
          token_id: tokenDetails.token_id,
        },
        { is_in_auction: false },
      );
      await this.updateAuction(
        {
          contract_address: contract_address,
          token_id: token_id,

          status: 'started',
        },
        { status: 'expired', winner: 'no bids' },
      );
      return [];
    } catch (error) {
      console.log(error);
      return {
        message: 'something went wrong',
        error,
      };
    }
  }
  /**************[NFT1155_TRANSFER]****************/
  async Nft1155Transfer(): Promise<any> {

  }
  /*****************[TRADE_VOLUME_FOR_COLLECTION]***************/
  async tradeVolume(tradeVolume: TradeVolume): Promise<any> {
    const { contract_address, price } = tradeVolume;

    try {
      console.log(tradeVolume);
      //  check contract_address is present or not,
      // check price is valid or not
      const curr_price = (await this.ContractModel.findOne({ contract_address })).trade_volume;

      console.log("curr_price", curr_price);
      return await this.ContractModel.updateOne({ contract_address }, { $set: { trade_volume: Number(curr_price) + Number(price) } });
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: 'Something went wrong in Trade Volume',
        error
      }
    }
  }
  /*****************[TRADE_VOLUME_FOR_NFT]***************/
  // async nftVolume(condition: any, price: number): Promise<any> {
  //   try {
  //     const curr_vol = (await this.nftService.getSingleNft(condition)).nft_volume;
  //     console.log("curr_vol", curr_vol);
  //     return await this.nftService.updateNft({ contract_address: condition.contract_address, token_id: condition.token_id }, { $set: { nft_volume: Number(curr_vol) + Number(price) } });
  //   } catch (error) {
  //     console.log(error);
  //     return {
  //       success: false,
  //       message: 'something went wrong',
  //       error
  //     }
  //   }
  // }
  /**********************[UPDATE_AUCTION]******************************/
  async updateAuction(data: any, update_data: any) {
    try {
      console.log('From Update Auction', data);
      const dat = await this.AuctionModel.findOneAndUpdate(data, {
        $set: update_data,
      });
      return dat;
    } catch (error) {
      console.log(error);
      return {
        message: 'something went wrong',
        error,
      };
    }
  }
  async addvolume(): Promise<any> {
    return await this.ContractModel.updateMany({}, { $set: { trade_volume: 0 } });
  }
  /***********************[GET_ALL_NFTS_IN_AUCTION]*********************/
  async getAllNftsInAuction(): Promise<any> {
    try {
      return await this.nftService.getNft({ is_in_auction: true });
    } catch (error) {
      console.log(error);
      return {
        message: 'something went wrong',
        error,
      };
    }
  }
  /***********************[GET_ALL_NFTS_IN_SALE]************************/
  async getAllNftsInSale(): Promise<any> {
    try {
      return await this.nftService.getNft({ is_in_sale: true });
    } catch (error) {
      console.log(error);
      return {
        message: 'something went wrong',
        error,
      };
    }
  }
  /***********************[GET_AUCTION]**********************/
  async getAuction(details: object): Promise<any> {
    try {
      console.log('on Service', details);
      return await this.AuctionModel.findOne(details);
    } catch (error) {
      console.log(error);
      return {
        message: 'something went wrong',
        error,
      };
    }
  }
  /**********************[GET_BID]**************************/
  async getBid(details: any): Promise<any> {
    try {
      return await this.BidModel.findOne(details);
    } catch (error) {
      console.log(error);
      return {
        message: 'something went wrong',
        error,
      };
    }
  }

  /************************[ERC1155] **********************/
  /********************[CREATE 1155 Sale]*******************/

  async create1155sale(sale:G2W3_1155Sale): Promise<any> {
    const {token_owner, contract_address, token_id, number_of_tokens,per_unit_price} = sale;
    try {
      const nft = await this.nftService.get1155Nft({contract_address,token_id});
      if(!nft) { 
        return { message:'nft not found'}
    }
      const checkOwner = await this.nftService.get1155NftOwner({contract_address,token_id,token_owner})
      if(!checkOwner) {
        return {
          message: 'Owner dont have any nft from the collection'
        }
      }

      const checkActiveSale = await this.Sale1155Model.find({token_owner,token_id,contract_address,status:'started'})
      if(checkActiveSale.length>0) {
        return {
          message: 'Sale Already Exists'
        }
      }
      // save in DB
      const save_in_db = await this.Sale1155Model.create(sale);
      //update in nft is in sale is true
      const update_nft = await this.nftService.update1155Nft(
        { contract_address, token_id },
        { is_in_sale: true },
      );
      // creating Activity
      const activity = {
        event: 'Sale',
        item: {
          name: update_nft.meta_data.name,
          contract_address,
          token_id,
          image: update_nft.meta_data.image,
        },
        price: per_unit_price,
        quantity: 1,
        from: token_owner,
        to: '----',
        read: false,
      };
      await this.activityService.createActivity(activity);
      return save_in_db;
    } catch (error) {
      console.log(error);
      return { message: 'something wrong in DB' };
    }
  }

  async update1155sale(sale:G2W3_1155Sale): Promise<any> {
    const {token_owner, contract_address, token_id, number_of_tokens,per_unit_price} = sale;
    const data = { token_owner, contract_address, token_id, status:'started'}
    try {
      const nft = await this.nftService.get1155Nft({contract_address,token_id});
      if(!nft) { 
        return { message:'nft not found'}
    }
      const checkOwner = await this.nftService.get1155NftOwner({contract_address,token_id,token_owner})
      if(!checkOwner) {
        return {
          message: 'Owner dont have any nft from the collection'
        }
      }

      const checkActiveSale = await this.Sale1155Model.find({token_owner,token_id,contract_address,status:'started'})
      if(checkActiveSale.length===0) {
        return {
          message: 'No any sales found'
        }
      }
      // save in DB
      const save_in_db = await this.Sale1155Model.findOneAndUpdate(data, { $set: sale });
   
      //update in nft is in sale is true
      const update_nft = await this.nftService.update1155Nft(
        { contract_address, token_id },
        { is_in_sale: true },
      );
      // creating Activity
      const activity = {
        event: 'Update Sale',
        item: {
          name: update_nft.meta_data.name,
          contract_address,
          token_id,
          image: update_nft.meta_data.image,
        },
        price: per_unit_price,
        quantity: 1,
        from: token_owner,
        to: '----',
        read: false,
      };
      await this.activityService.createActivity(activity);
      return save_in_db;
    } catch (error) {
      console.log(error);
      return { message: 'something wrong in DB' };
    }
  }

    async cancel1155sale(sale:G2W3_1155Sale): Promise<any> {
    const {token_owner, contract_address, token_id, number_of_tokens,per_unit_price} = sale;
    const data = { token_owner, contract_address, token_id,status:'started'}
    try {
      const nft = await this.nftService.get1155Nft({contract_address,token_id});
      if(!nft) { 
        return { message:'nft not found'}
    }
      const checkOwner = await this.nftService.get1155NftOwner({contract_address,token_id,token_owner})
      if(!checkOwner) {
        return {
          message: 'Owner dont have any nft from the collection'
        }
      }
      const check_users_sales = await this.Sale1155Model.find({token_owner,contract_address,token_id,status:'started'});
      if(check_users_sales.length===0){
        return {
          message: 'No sales found'
        }
      }
      // save in DB
      const save_in_db = await this.Sale1155Model.findOneAndUpdate(data, { $set: {status:'cancelled'} });

      const check_sales = await this.Sale1155Model.find({contract_address,token_id,status:'started'});
      //update in nft is in sale is true
      const update_nft = await this.nftService.update1155Nft(
        { contract_address, token_id },
        { is_in_sale: check_sales.length>0?true:false },
      );
      // creating Activity
      const activity = {
        event: 'Cancel Sale',
        item: {
          name: update_nft.meta_data.name,
          contract_address,
          token_id,
          image: update_nft.meta_data.image,
        },
        price: per_unit_price,
        quantity: 1,
        from: token_owner,
        to: '----',
        read: false,
      };
      await this.activityService.createActivity(activity);
      return save_in_db;
    } catch (error) {
      console.log(error);
      return { message: 'something wrong in DB' };
    }
  }
  async make1155offer(sale:G2W3_1155Offer): Promise<any> {
    const {offer_user_address, contract_address, token_id, number_of_tokens,per_unit_price} = sale;
    try {
      const check_sales = await this.Sale1155Model.find({contract_address,token_id,status:'started'});
      if(check_sales.length===0) {
        return {
          message:'Sale inactive'
        }
      }
      // save in DB
      const save_in_db = await this.Offer1155Model.create(sale);
      //update in nft is in sale is true
      const update_nft = await this.nftService.update1155Nft(
        { contract_address, token_id },
        { is_in_sale: true },
      );
      // creating Activity
      const activity = {
        event: 'Create Offer',
        item: {
          name: update_nft.meta_data.name,
          contract_address,
          token_id,
          image: update_nft.meta_data.image,
        },
        price: per_unit_price,
        quantity: 1,
        from: offer_user_address,
        to: '----',
        read: false,
      };
      await this.activityService.createActivity(activity);
      return save_in_db;
    } catch (error) {
      console.log(error);
      return { message: 'something wrong in DB' };
    }
  }

  async update1155offer(sale:G2W3_1155Offer): Promise<any> {
    const {offer_user_address, contract_address, token_id, number_of_tokens,per_unit_price} = sale;
    const data = {
      offer_user_address, contract_address, token_id,status:'started'
    }
    try {
      const check_sales = await this.Sale1155Model.find({contract_address,token_id,status:'started'});
      if(check_sales.length===0) {
        return {
          message:'Sale inactive'
        }
      }
      const check_offer = await this.Offer1155Model.find(data);
      if(!check_offer) {
        return { message : 'Offer Not Found'}
      }
      // save in DB
      const save_in_db = await this.Offer1155Model.findOneAndUpdate(data, { $set: sale });
      //update in nft is in sale is true
      const update_nft = await this.nftService.update1155Nft(
        { contract_address, token_id },
        { is_in_sale: true },
      );
      // creating Activity
      const activity = {
        event: 'Update Offer',
        item: {
          name: update_nft.meta_data.name,
          contract_address,
          token_id,
          image: update_nft.meta_data.image,
        },
        price: per_unit_price,
        quantity: 1,
        from: offer_user_address,
        to: '----',
        read: false,
      };
      await this.activityService.createActivity(activity);
      return save_in_db;
    } catch (error) {
      console.log(error);
      return { message: 'something wrong in DB' };
    }
  }

  async cancel1155offer(sale:G2W3_1155Offer): Promise<any> {
    const {offer_user_address, contract_address, token_id, number_of_tokens,per_unit_price} = sale;
    const data = {
      offer_user_address, contract_address, token_id,status:'started'
    }
    try {
      const check_sales = await this.Sale1155Model.find({contract_address,token_id,status:'started'});
      if(check_sales.length===0) {
        return {
          message:'Sale inactive'
        }
      }

      const check_offer = await this.Offer1155Model.find(data);
      if(!check_offer) {
        return { message : 'Offer Not Found'}
      }
      // save in DB
      const save_in_db = await this.Offer1155Model.findOneAndUpdate(data, { $set: {status:'cancelled'} });
      //update in nft is in sale is true
      const update_nft = await this.nftService.update1155Nft(
        { contract_address, token_id },
        { is_in_sale: true },
      );
      // creating Activity
      const activity = {
        event: 'Update Offer',
        item: {
          name: update_nft.meta_data.name,
          contract_address,
          token_id,
          image: update_nft.meta_data.image,
        },
        price: per_unit_price,
        quantity: 1,
        from: offer_user_address,
        to: '----',
        read: false,
      };
      await this.activityService.createActivity(activity);
      return save_in_db;
    } catch (error) {
      console.log(error);
      return { message: 'something wrong in DB' };
    }
  }

  async getAll1155offer(body:any): Promise<any> {
    try {
      const all_offers = await this.Offer1155Model.find(body);
      if(!all_offers) {
        return {
          message: 'No Offers Found'
        }
      }
      return all_offers;
    } catch (error) {
      console.log(error);
      return { message: 'something wrong in DB' };
    }
  }

  async accept1155offer(body:G2W3_1155AcceptOffer): Promise<any> {
    try {
      
      const {offer_user_address, token_owner,token_id,contract_address,number_of_tokens,per_unit_price} = body;

      const check_sales = await this.Sale1155Model.find({contract_address,token_id,status:'started'});
      if(!check_sales) {
        return {
          message:'Sale inactive'
        }
      }

      const check_offer = await this.Offer1155Model.find({offer_user_address,contract_address,token_id,status:'started'});
      if(!check_offer) {
        return { message : 'Offer Not Found'}
      }
      // Blockchain Integration

      // activity 

      return {
        message:'waiting....'
      }
    } catch (error) {
      console.log(error);
      return { message: 'something wrong in DB' };
    }
  }

}

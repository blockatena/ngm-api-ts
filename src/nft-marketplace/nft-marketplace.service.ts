import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuctionDocument, AuctionSchema } from 'src/schemas/auction.schema';
import { BidDocument, BidSchema } from 'src/schemas/bid.schema';
import { CreateAuctionBody } from './dtos/create_auction.dto';
import { CancelBidBody, CreateBidBody } from './dtos/create_bid.dto';
import { NftDocument, NftSchema } from 'src/schemas/nft.schema';
import { ContractDocument, ContractSchema } from 'src/schemas/contract.schema';
import { CronjobService } from 'src/cronjob/cronjob.service';
import { Cancel_Sale_Body, Create_Sale_Body } from './dtos/create-sale.dto';
import { SalesDocument, SalesSchema } from 'src/schemas/sales.schema';
import {
  OfferDocument,
  offerSchema,
  OfferSchema,
} from 'src/schemas/offer.schema';
import {
  accept_Offer_Body,
  create_Offer_Body,
  get_all_offers_Body,
} from './dtos/create_offer.dto';
@Injectable()
export class NftMarketplaceService {
  constructor(
    private Cron_job: CronjobService,
    @InjectModel(ContractSchema.name)
    private ContractModel: Model<ContractDocument>,
    @InjectModel(AuctionSchema.name)
    private AuctionModel: Model<AuctionDocument>,
    @InjectModel(BidSchema.name) private BidModel: Model<BidDocument>,
    @InjectModel(NftSchema.name) private NftModel: Model<NftDocument>,
    @InjectModel(SalesSchema.name) private SalesModel: Model<SalesDocument>,
    @InjectModel(OfferSchema.name) private OfferModel: Model<OfferDocument>,
  ) {
    AuctionModel;
    BidModel;
    NftModel;
    ContractModel;
    SalesModel;
    OfferModel;
  }
  /*********************[AUCTION-SERVICES]**********************/
  async create_auction(createAuction: CreateAuctionBody): Promise<any> {
    let data = await (await this.AuctionModel.create(createAuction)).save();
    await this.update_nft(
      {
        contract_address: createAuction.contract_address,
        token_id: createAuction.token_id,
      },
      { is_in_auction: true },
    );
    console.log(data.end_date);
    //  Adding Cron Job
    this.Cron_job.addCornJob(
      `${createAuction.contract_address}${createAuction.token_id}`,
      data.end_date,
      async () => {
        console.log('winner is ');
        const winnerdata = await this.declareWinner(data._id);
        //update status to bid and auction add winner also
        // update after auction ,set auction status to false
        await this.update_nft(
          {
            contract_address: createAuction.contract_address,
            token_id: createAuction.token_id,
          },
          { is_in_auction: false },
        );
        const winner_info =
          winnerdata.length === 0 ? 'No bids for this auction' : winnerdata;
        console.log(winner_info);
        await this.update_auction(
          { _id: data._id },
          { status: 'expired', winner: winner_info },
        );
        // After auction this cron job will be deleted // need to fix with unique id
        this.Cron_job.deleteCron(
          `${createAuction.contract_address}${createAuction.token_id}`,
        );
      },
    );
    return data;
  }
  /*********[CANCEL-AUCTION-SERVICE]*******/
  async cancel_auction(auction_id: string, cronjob_id: string): Promise<any> {
    console.log('auction_id', auction_id);
    // this.schedulerRegistry.deleteCronJob(cronjob_id);
    try {
      this.Cron_job.deleteCron(cronjob_id);
      const auction_data = await this.get_auction({ _id: auction_id });
      this.update_nft(
        {
          contract_address: auction_data.contract_address,
          token_id: auction_data.token_id,
        },
        { is_in_auction: false },
      );
      return await this.update_auction(
        { _id: auction_id },
        { status: 'cancelled' },
      );
    } catch (error) {
      console.log(error);
      return {
        message:
          'something went wrong ,our team is working on it.For any Queries you  can contact us to our official mail',
        contact: 'emailaddress@gmail.com',
      };
    }
  }
  /************************************/
  /****************[BID_SERVICES]*************/
  async create_bid(createBid: CreateBidBody): Promise<any> {
    const data = await (await this.BidModel.create(createBid)).save();
    this.Cron_job.addCornJob(
      `${data.bidder_address}${data.token_id}`,
      createBid.bid_expiresin,
      async () => {
        await this.update_bid({ _id: data._id }, { status: 'expired' });
        console.log('bid expired');
      },
    );
    return data;
  }
  /**********[CANCEL-BID-SERVICE]*********/
  async cancel_bid(bid_data: CancelBidBody): Promise<any> {
    try {
      const message = await this.update_bid(
        { _id: bid_data.bid_id },
        { status: 'cancelled' },
      );
      this.Cron_job.deleteCron(
        `${bid_data.bidder_address}${bid_data.token_id}`,
      );
      return {
        message,
      };
    } catch (error) {
      console.log(error);
      return {
        message:
          'something went wrong ,our team is working on it.For any Queries you  can contact us to our official mail',
        contact: 'emailaddress@gmail.com',
      };
    }
  }
  /***************************/
  /******************[CREATE SALE]**************/
  async create_sale(sale: Create_Sale_Body): Promise<any> {
    // save in DB
    const save_in_db = await (await this.SalesModel.create(sale)).save();
    //create cron job
    this.Cron_job.addCornJob(
      `${sale.contract_address}${sale.token_id}`,
      sale.end_date,
      async () => {
        console.log('sale ended');
        await this.update_sale({ _id: save_in_db._id }, { status: 'ended' });
        await this.update_nft(
          {
            contract_address: sale.contract_address,
            token_id: sale.token_id,
          },
          { is_in_sale: false },
        );
      },
    );
    //update in nft is in auction is true
    const update_nft = await this.update_nft(
      { contract_address: sale.contract_address, token_id: sale.token_id },
      { is_in_sale: true },
    );
    return { save_in_db, update_nft };
  }
  async cancel_sale(cancel: Cancel_Sale_Body): Promise<any> {
    //delete cron job
    try {
      this.Cron_job.deleteCron(cancel.cronjob_id);
      //update status of the sale
      const sales_update = await this.update_sale(
        { _id: cancel.sale_id },
        { status: 'cancelled' },
      );
      const nft_update = await this.update_nft(
        {
          contract_address: cancel.contract_address,
          token_id: cancel.token_id,
        },
        { is_in_sale: false },
      );
      return { sales_update, nft_update };
    } catch (error) {
      console.log(error);
      return { message: 'something wrong in DB or with Cron Jobs' };
    }
  }
  //CRUD for sale schema
  async get_sale(saleData: any) {
    return await this.SalesModel.findOne({ _id: saleData });
  }
  async update_sale(data: any, update_data: any) {
    await this.SalesModel.findOneAndUpdate(data, { $set: update_data });
  }

  //************************************************* */
  //********[CREATE-OFFER]*******/
  async create_offer(offer: create_Offer_Body) {
    return await (await this.OfferModel.create(offer)).save();
  }
  async accept_offer(accept_Data: accept_Offer_Body) {
    try {
      const offer_msg = await this.update_offer(
        { _id: accept_Data.offer_id },
        { offer_status: 'accepted' },
      );
      // const Nft_msg = await this.update_nft({},{})
      return;
    } catch (error) {
      console.log(error);
      return {
        message: 'Something went Wrong in DB',
        status: 'Our Team is looking into it ',
      };
    }
  }
  async get_offer(offer_Data: any): Promise<any> {
    return await this.OfferModel.findOne(offer_Data);
  }
  async get_all_offers(saleData: get_all_offers_Body) {
    return await this.OfferModel.find({ sale_id: saleData.sale_id });
  }
  async update_offer(offer_data: Object, update_data: Object) {
    return await this.OfferModel.findOneAndUpdate(offer_data, {
      $set: update_data,
    });
  }
  // *************************/
  async declareWinner(Auction_id: any) {
    //currently its a demo version need to add actual functionality later
    let data = await this.BidModel.find({
      auction_id: Auction_id,
      status: 'started',
    })
      .sort({ bid_amount: -1 })
      .limit(1);
    return data;
  }

  async get_Nft(details: any): Promise<any> {
    console.log(details);
    return await this.NftModel.findOne(details);
  }
  async update_bid(condition: Object, values: Object) {
    try {
      return await this.BidModel.updateOne(condition, values);
    } catch (error) {
      return { message: 'something went wrong', error: error };
    }
  }
  async update_nft(data: any, update_data: any) {
    return await this.NftModel.updateOne(data, {
      $set: update_data,
    });
  }

  //
  async update_auction(data: any, update_data: any) {
    return await this.AuctionModel.findOneAndUpdate(data, {
      $set: update_data,
    });
  }

  //

  async get_all_Nfts_inauction() {
    return await this.NftModel.findOne({ is_in_auction: true });
  }
  async get_auction(details: any): Promise<any> {
    return await this.AuctionModel.findOne(details);
  }
  async get_bid(details: any): Promise<any> {
    return await this.BidModel.findOne(details);
  }
  // get routes

  async getCrons() {
    return this.Cron_job.getCrons();
  }
}

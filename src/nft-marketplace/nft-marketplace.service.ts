import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuctionDocument, AuctionSchema } from 'src/schemas/auction.schema';
import { BidDocument, BidSchema } from 'src/schemas/bid.schema';
import { CreateAuctionBody } from './dtos/create_auction.dto';
import { CancelBidBody, CreateBidBody, GetBids } from './dtos/create_bid.dto';
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
  async CreateAuction(createAuction: CreateAuctionBody): Promise<any> {
    try {
      await this.update_nft(
        {
          contract_address: createAuction.contract_address,
          token_id: createAuction.token_id,
        },
        { is_in_auction: true },
      );
      //  Adding Cron Job
      this.Cron_job.addCornJob(
        `${createAuction.contract_address}${createAuction.token_id}`,
        createAuction.end_date,
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
            {
              contract_address: createAuction.contract_address,
              token_id: createAuction.token_id,

              status: 'started',
              // can add more validations if you want
            },
            { status: 'expired', winner: winner_info },
          );
          // After auction this cron job will be deleted // need to fix with unique id
          this.Cron_job.deleteCron(
            `${createAuction.contract_address}${createAuction.token_id}`,
          );
        },
      );
      const data = await (await this.AuctionModel.create(createAuction)).save();

      return data;
    } catch (error) {
      console.log(error);
      /* if anything goes wrong we need to revert back to earlier status */
      await this.update_nft(
        {
          contract_address: createAuction.contract_address,
          token_id: createAuction.token_id,
        },
        { is_in_auction: true },
      );
      return {
        message: 'something went wrong',
      };
    }
  }
  /*********[CANCEL-AUCTION-SERVICE]*******/
  async CancelAuction(
    contract_address: string,
    token_id: string,
  ): Promise<any> {
    console.log('auction_id', contract_address, token_id);
    // this.schedulerRegistry.deleteCronJob(cronjob_id);
    const cronjob_id = `${contract_address}${token_id}`;

    try {
      this.Cron_job.deleteCron(cronjob_id);
      const auction_data = await this.GetAuction({
        contract_address,
        token_id,
        status: 'started',
        // need to add one more ,which is date
      });
      this.update_nft(
        {
          contract_address: auction_data.contract_address,
          token_id: auction_data.token_id,
        },
        { is_in_auction: false },
      );
      const success_data = await this.update_auction(
        {
          _id: auction_data._id,
          contract_address,
          token_id,
          status: 'started',
        },
        { status: 'cancelled' },
      );
      return { success_data, message: 'Successfully deleted' };
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
  async CreateBid(createBid: CreateBidBody): Promise<any> {
    const { token_id, contract_address, bid_expiresin, bidder_address } =
      createBid;
    // Id creation for cron job may be changed in future
    try {
      this.Cron_job.addCornJob(
        `${contract_address}${token_id}${bidder_address}`,
        createBid.bid_expiresin,
        async () => {
          await this.update_bid(
            { token_id, contract_address, status: 'started' },
            { status: 'expired' },
          );
          console.log('bid expired');
        },
      );
      const data = await (await this.BidModel.create(createBid)).save();

      return data;
    } catch (error) {
      console.log(error);
    }
  }
  /**********[CANCEL-BID-SERVICE]*********/
  async CancelBid(bid_data: CancelBidBody): Promise<any> {
    const { contract_address, bidder_address, token_id } = bid_data;
    try {
      const message = await this.update_bid(
        { contract_address, bidder_address, token_id, status: 'started' },
        { status: 'cancelled' },
      );
      this.Cron_job.deleteCron(
        `${contract_address}${token_id}${bidder_address}`,
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
  /************[GET BIDS FOR AUCTION]**********/
  async GetBidsForAuction(bid: GetBids): Promise<any> {
    try {
      const { contract_address, token_id } = bid;
      const bid_data = await this.BidModel.find({ contract_address, token_id });
    } catch (error) {}
  }
  /***************************/
  /******************[CREATE SALE]**************/
  async CreateSale(sale: Create_Sale_Body): Promise<any> {
    // save in DB
    const save_in_db = await (await this.SalesModel.create(sale)).save();
    //create cron job
    this.Cron_job.addCornJob(
      `${sale.contract_address}${sale.token_id}`,
      sale.end_date,
      async () => {
        console.log('sale ended');
        await this.UpdateSale({ _id: save_in_db._id }, { status: 'ended' });
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
  async CancelSale(cancel: Cancel_Sale_Body): Promise<any> {
    //delete cron job
    try {
      this.Cron_job.deleteCron(cancel.cronjob_id);
      //update status of the sale
      const sales_update = await this.UpdateSale(
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
  async GetSale(saleData: any) {
    return await this.SalesModel.findOne({ _id: saleData });
  }
  async UpdateSale(data: any, update_data: any) {
    await this.SalesModel.findOneAndUpdate(data, { $set: update_data });
  }

  //************************************************* */
  //********[CREATE-OFFER]*******/
  async CreateOffer(offer: create_Offer_Body) {
    return await (await this.OfferModel.create(offer)).save();
  }
  async AcceptOffer(accept_Data: accept_Offer_Body) {
    try {
      const offer_msg = await this.UpdateOffer(
        { _id: accept_Data.offer_id },
        { offer_status: 'accepted' },
      );
      // change owner
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
  async GetOffer(offer_Data: any): Promise<any> {
    return await this.OfferModel.findOne(offer_Data);
  }
  async GetAllOffers(saleData: get_all_offers_Body) {
    return await this.OfferModel.find({ sale_id: saleData.sale_id });
  }
  async UpdateOffer(offer_data: Object, update_data: Object) {
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

  async GetNft(details: any): Promise<any> {
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
    console.log('From Update Auction', data);
    const dat = await this.AuctionModel.findOneAndUpdate(data, {
      $set: update_data,
    });
    return dat;
  }

  //

  async get_all_Nfts_inauction() {
    return await this.NftModel.findOne({ is_in_auction: true });
  }
  async GetAuction(details: any): Promise<any> {
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

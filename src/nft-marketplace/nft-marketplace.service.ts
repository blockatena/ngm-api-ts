import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuctionDocument, AuctionSchema } from 'src/schemas/auction.schema';
import { BidDocument, BidSchema } from 'src/schemas/bid.schema';
import { CreateAuctionBody } from './dtos/create_auction.dto';
import { CancelBidBody, CreateBidBody } from './dtos/create_bid.dto';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { NftDocument, NftSchema } from 'src/schemas/nft.schema';
import { ContractDocument, ContractSchema } from 'src/schemas/contract.schema';
import { Market_Place_Constants } from 'src/utils/constants/MARKETPLACE/marketplace.constants';
import { CronjobService } from 'src/cronjob/cronjob.service';
import { Create_Sale_Body } from './dtos/create-sale.dto';
import { SalesDocument, SalesSchema } from 'src/schemas/sales.schema';
import { OfferDocument, OfferSchema } from 'src/schemas/offer.schema';
@Injectable()
export class NftMarketplaceService {
  // private readonly logger = new Logger(NftMarketplaceService.name);
  constructor(
    private mrkt_constants: Market_Place_Constants,
    // private schedulerRegistry: SchedulerRegistry,
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
        { status: this.mrkt_constants.CANCELLED || 'cancelled' },
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
  async cancel_bid(bid_data: CancelBidBody): Promise<any> {
    try {
      const message = await this.update_bid(
        { _id: bid_data.bid_id },
        { status: this.mrkt_constants.CANCELLED || 'cancelled' },
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

  async create_bid(createBid: CreateBidBody): Promise<any> {
    // createBid[`status`] = 'started';
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
  // ******************[CREATE SALE]**************//
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
      },
    );
    // save in DB
    //update in nft is in auction is true
  }

  async update_sale(data: any, update_data: any) {
    await this.SalesModel.updateOne(data, { $set: update_data });
  }

  //************************************************* */
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
    return await this.AuctionModel.updateOne(data, {
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
  async getcollections() {
    return await this.ContractModel.find({});
  }

  async getCrons() {
    return this.Cron_job.getCrons();
  }
}

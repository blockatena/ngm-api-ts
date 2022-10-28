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
import { async } from 'rxjs';
@Injectable()
export class NftMarketplaceService {
  private readonly logger = new Logger(NftMarketplaceService.name);
  constructor(
    private mrkt_constants: Market_Place_Constants,
    private schedulerRegistry: SchedulerRegistry,
    @InjectModel(ContractSchema.name)
    private ContractModel: Model<ContractDocument>,
    @InjectModel(AuctionSchema.name)
    private AuctionModel: Model<AuctionDocument>,
    @InjectModel(BidSchema.name) private BidModel: Model<BidDocument>,
    @InjectModel(NftSchema.name) private NftModel: Model<NftDocument>,
  ) {
    AuctionModel;
    BidModel;
    NftModel;
    ContractModel;
  }

  async create_auction(createAuction: CreateAuctionBody): Promise<any> {
    createAuction[`status`] = this.mrkt_constants.STARTED || 'started';
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
    this.addCornJob(
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
      },
    );
    return data;
  }

  async cancel_auction(auction_id: string, cronjob_id: string): Promise<any> {
    console.log('auction_id', auction_id);
    // this.schedulerRegistry.deleteCronJob(cronjob_id);
    try {
      this.deleteCron(cronjob_id);
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
      this.deleteCron(`${bid_data.bidder_address}${bid_data.token_id}`);
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
    createBid[`status`] = 'started';
    const data = await (await this.BidModel.create(createBid)).save();
    this.addCornJob(
      `${data.bidder_address}${data.token_id}`,
      createBid.bid_expiresin,
      async () => {
        await this.update_bid({ _id: data._id }, { status: 'expired' });
        console.log('bid expired');
      },
    );
    return data;
  }

  addCornJob(name: string, date: string, callback: any) {
    console.log('date', date);
    const job = new CronJob(new Date(date), callback);
    this.schedulerRegistry.addCronJob(name, job);
    job.start();
    this.logger.warn(`job ${name} added for each minute at ${date} seconds!`);
  }
  deleteCron(name: string) {
    try {
      console.log(name);
      const job = this.getCrons();
      console.log(job);
      this.schedulerRegistry.deleteCronJob(name);
      this.logger.warn(`job ${name} deleted!`);
    } catch (err) {
      console.log(err);
    }
  }
  getCrons() {
    const jobs = this.schedulerRegistry.getCronJobs();
    let arr = [];
    jobs.forEach((value, key, map) => {
      let next;
      try {
        next = value.nextDates().toJSDate();
      } catch (e) {
        next = 'error: next fire date is in the past!';
      }
      arr.push(`job: ${key} next: ${next}`);
    });
    return arr;
  }
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
}

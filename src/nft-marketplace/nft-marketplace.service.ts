import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuctionDocument, AuctionSchema } from 'src/schemas/auction.schema';
import { BidDocument, BidSchema } from 'src/schemas/bid.schema';
import { CreateAuctionBody } from './dtos/create_auction.dto';
import { CreateBidBody } from './dtos/create_bid.dto';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { NftService } from 'src/nft/nft.service';
import { NftDocument, NftSchema } from 'src/schemas/nft.schema';
import { getNft } from 'src/nft/nftitems/createNft.dto';
import { ContractDocument, ContractSchema } from 'src/schemas/contract.schema';
@Injectable()
export class NftMarketplaceService {
  private readonly logger = new Logger(NftMarketplaceService.name);

  // @Cron(new Date('2022-10-18T16:54:00'))
  // handleCron() {
  //   this.logger.debug('Called when the current second is 45');
  // }
  constructor(
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
    createAuction[`status`] = 'started';
    let data = await (await this.AuctionModel.create(createAuction)).save();
    await this.update_nft_status(
      {
        contract_address: createAuction.contract_address,
        token_id: createAuction.token_id,
      },
      { is_in_auction: true },
    );
    console.log(data.end_date);
    this.addCornJob(data._id, data.end_date, async () => {
      console.log('winner is ');
      const winnerdata = await this.declareWinner(data._id);
      //update status to bid and auction add winner also
      // update after auction ,set auction status to false
      await this.update_nft_status(
        {
          contract_address: createAuction.contract_address,
          token_id: createAuction.token_id,
        },
        { is_in_auction: false },
      );
      const winner_info =
        winnerdata.length == 0 ? 'No bids for this auction' : winnerdata;
      await this.update_auction(
        { _id: data._id },
        { status: 'expired', winner: winner_info },
      );
    });
    return data;
  }

  async cancel_auction(auction_id: string): Promise<any> {
    console.log('auction_id', auction_id);
    this.schedulerRegistry.deleteCronJob(auction_id);
    // this.deleteCron(auction_id);
    const auction_data = await this.get_auction({ _id: auction_id });
    this.update_nft_status(
      {
        contract_address: auction_data.contract_address,
        token_id: auction_data.token_id,
      },
      { is_in_auction: false },
    );
    return await this.AuctionModel.deleteOne({ _id: auction_id });
  }
  async cancel_bid(bid_id: string): Promise<any> {
    const message = await this.BidModel.deleteOne({ _id: bid_id });
    const cron = this.deleteCron(bid_id);
    return {
      message,
      cron,
    };
  }

  async create_bid(createBid: CreateBidBody): Promise<any> {
    const data = await (await this.BidModel.create(createBid)).save();
    this.addCornJob(data._id, createBid.bid_expiresin, () => {
      console.log('bid expired');
    });
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
    let data = await this.BidModel.find({ auction_id: Auction_id })
      .sort({ bid_amount: -1 })
      .limit(1);
    return data;
  }

  async get_Nft(details: any): Promise<any> {
    console.log(details);
    return await this.NftModel.findOne(details);
  }
  async update_status_bid(condition: Object, values: Object) {
    try {
      return this.BidModel.updateOne(condition, values);
    } catch (error) {
      return { message: 'something went wrong', error: error };
    }
  }
  async update_nft_status(data: any, update_data: any) {
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

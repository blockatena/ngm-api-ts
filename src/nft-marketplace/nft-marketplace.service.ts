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
@Injectable()
export class NftMarketplaceService {
  private readonly logger = new Logger(NftMarketplaceService.name);

  // @Cron(new Date('2022-10-18T16:54:00'))
  // handleCron() {
  //   this.logger.debug('Called when the current second is 45');
  // }
  constructor(
    private schedulerRegistry: SchedulerRegistry,
    @InjectModel(AuctionSchema.name)
    private AuctionModel: Model<AuctionDocument>,
    @InjectModel(BidSchema.name) private BidModel: Model<BidDocument>,
    @InjectModel(NftSchema.name) private NftModel: Model<NftDocument>,
  ) {
    AuctionModel;
    BidModel;
    NftModel;
  }

  async create_auction(createAuction: CreateAuctionBody): Promise<any> {
    let data = await (await this.AuctionModel.create(createAuction)).save();
    await this.NftModel.updateOne(
      { token_id: createAuction.token_id },
      { $set: { is_in_auction: true } },
    );
    console.log(data.end_date);
    this.addCornJob(data._id, data.end_date, async () => {
      console.log('winner is ');
      console.log(await this.declareWinner(data._id));
    });

    return data;
  }

  async cancel_auction(auction_id: string): Promise<any> {
    await this.AuctionModel.deleteOne({ _id: auction_id });
  }
  async cancel_bid(bid_id): Promise<any> {
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
    this.schedulerRegistry.deleteCronJob(name);
    this.logger.warn(`job ${name} deleted!`);
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
  async update_nft_auction_status(token_id: string, status: boolean) {
    return await this.NftModel.updateOne(
      { token_id: token_id },
      {
        $set: {
          is_in_auction: status,
        },
      },
    );
  }
  async get_all_Nfts_inauction() {
    return await this.NftModel.findOne({ is_in_auction: true });
  }
  async get_auction(details: any): Promise<any> {
    return await this.AuctionModel.findOne({ _id: details });
  }
  async get_bid(details: any): Promise<any> {
    return await this.BidModel.findOne({ _id: details });
  }
}

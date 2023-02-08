import { OnModuleInit } from '@nestjs/common';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NftMarketplaceService } from './marketplace/marketplace.service';
require('dotenv').config();
const cron_time = process.env.CRON_TIME || '*/30 * * * * *';
@Injectable()
export class AppService implements OnModuleInit {
  private readonly logger = new Logger(AppService.name);
  constructor(private nftmrktservice: NftMarketplaceService) { }
  @Cron(cron_time)
  async handleCron() {
    //need to check end date for auction if the end date is less we nned to call the winner
    const all_auctions = await this.nftmrktservice.getAllAuctions();
    // console.log('****************************');
    // console.log('Getting All Auctions', all_auctions);
    // console.log('****************************');
    //  new Date('2017-09-28T22:59:02.448804522Z') > new Date()
    // true
    // new Date('2017-09-28T22:59:02.448804522Z') < new Date();
    // false

    all_auctions.forEach(async (auction) => {
      if (new Date(auction.end_date) <= new Date()) {
        // console.log(
        //   '',
        //   new Date(auction.end_date).toISOString(),
        //   ' <',
        //   new Date(auction.start_date).toISOString(),
        //   '   ==',
        //   new Date(auction.end_date) < new Date(),
        // );
        // console.log('auction over');
        await this.nftmrktservice.declareWinner(auction);
      }
    });
  }
  onModuleInit() {
    console.log(`Initialization...`);
    this.handleCron();
  }
}

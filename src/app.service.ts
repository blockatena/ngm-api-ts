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
  async checkAuction721() {
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
  @Cron(cron_time)
  async checkSale1155() {
    console.log('running 1155 cron')
    const all_sales = await this.nftmrktservice.getAll1155sale({status:'started'});
    all_sales.forEach(async (sale) => {
      if(new Date(sale.end_date) <= new Date()) {
        await this.nftmrktservice.handle1155Sales(sale);
      }
    })
    //check 1155
    // take reference from the above code.

  }
  async onModuleInit() {
    console.log(`Initialization...`);
    await this.checkAuction721();
    await this.checkSale1155();
  }
}

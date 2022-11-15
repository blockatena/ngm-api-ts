import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuctionDocument, AuctionSchema } from 'src/schemas/auction.schema';
import { BidDocument, BidSchema } from 'src/schemas/bid.schema';
import { CreateAuctionBody } from './dtos/create_auction.dto';
import {
  CancelBidBody,
  CreateBidBody,
  GetBids,
  updateAllBids,
} from './dtos/create_bid.dto';
import { NftDocument, NftSchema } from 'src/schemas/nft.schema';
import { ContractDocument, ContractSchema } from 'src/schemas/contract.schema';
import { CronjobService } from 'src/cronjob/cronjob.service';
import { Cancel_Sale_Body, Create_Sale_Body } from './dtos/create-sale.dto';
import { SalesDocument, SalesSchema } from 'src/schemas/sales.schema';
import { OfferDocument, OfferSchema } from 'src/schemas/offer.schema';
import {
  accept_Offer_Body,
  create_Offer_Body,
  get_all_offers_Body,
} from './dtos/create_offer.dto';
import { abi as marketplaceAbi } from 'src/utils/constants/MARKETPLACE/marketplace.abi';
import { ethers } from 'ethers';

const mum_provider = new ethers.providers.JsonRpcProvider(
  process.env.MATIC_MUMBAI_RPC_URL,
);
const wallet = new ethers.Wallet(process.env.PRIV_KEY, mum_provider);

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
  async createAuction(createAuction: CreateAuctionBody): Promise<any> {
    const { contract_address, token_id } = createAuction;
    try {
      // updating nft status in auction
      await this.update_nft(
        {
          contract_address: createAuction.contract_address,
          token_id: createAuction.token_id,
        },
        { is_in_auction: true },
      );

      const data = await this.AuctionModel.create(createAuction);
      console.log('Auction Created', data);
      const auction_id = data._id;

      //  Adding Cron Job
      this.Cron_job.addCornJob(
        `${createAuction.contract_address}${createAuction.token_id}`,
        createAuction.end_date,
        async () => {
          console.log('Auction_id ', auction_id);
          const winnerdata = await this.declareWinner({
            auction_id,
            token_id: createAuction.token_id,
            contract_address: createAuction.contract_address,
          });
          console.log("winner's data", winnerdata);
        },
      );

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
    // this.schedulerRegistry.deleteCronJob(cronjob_id);
    const cronjob_id = `${contract_address}${token_id}`;

    try {
      //  delete cron job
      this.Cron_job.deleteCron(cronjob_id);
      const auction_data = await this.getAuction({
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
      //update in all bids

      await this.updateAllbids(
        {
          contract_address,
          token_id,
          status: 'started',
        },
        { status: 'CancelledByAuctionOwner' },
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
  async createBid(createBid: object): Promise<any> {
    // const { token_id, contract_address, bidder_address } = createBid;
    // Id creation for cron job may be changed in future
    try {
      console.log(createBid);
      // this.Cron_job.addCornJob(
      //   `${contract_address}${token_id}${bidder_address}`,
      //   createBid.bid_expires_in,
      //   async () => {
      //     await this.update_bid(
      //       { token_id, contract_address, status: 'started' },
      //       { status: 'expired' },
      //     );
      //     console.log('bid expired');
      //   },
      // );
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
      const message = await this.update_bid(
        { contract_address, bidder_address, token_id, status: 'started' },
        { status: 'cancelled' },
      );
      // this.Cron_job.deleteCron(
      //   `${contract_address}${token_id}${bidder_address}`,
      // );
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
  //helpers 'cancelledbyAuctionOwner'
  async updateAllbids(
    condition: updateAllBids,
    update_info: object,
  ): Promise<any> {
    const { contract_address, token_id } = condition;

    try {
      await this.BidModel.updateMany(
        { contract_address, token_id, status: 'started' },
        { $set: update_info },
      );
    } catch (error) {
      console.log(error);
      return {
        message: 'something went wrong while updating all bids',
      };
    }
  }
  /************[GET BIDS FOR AUCTION]**********/
  async getBidsForAuction(bid: GetBids): Promise<any> {
    try {
      const { contract_address, token_id } = bid;
      const bid_data = await this.BidModel.find({ contract_address, token_id });
    } catch (error) {}
  }
  /***************************/
  /******************[CREATE SALE]**************/
  async createSale(sale: Create_Sale_Body): Promise<any> {
    // save in DB
    const save_in_db = await (await this.SalesModel.create(sale)).save();
    //create cron job
    this.Cron_job.addCornJob(
      `${sale.contract_address}${sale.token_id}`,
      sale.end_date,
      async () => {
        console.log('sale ended');
        await this.updateSale({ _id: save_in_db._id }, { status: 'ended' });
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
  async cancelSale(cancel: Cancel_Sale_Body): Promise<any> {
    //delete cron job
    try {
      this.Cron_job.deleteCron(cancel.cronjob_id);
      //update status of the sale
      const sales_update = await this.updateSale(
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
  async getSale(saleData: any) {
    return await this.SalesModel.findOne({ _id: saleData });
  }
  async updateSale(data: any, update_data: any) {
    await this.SalesModel.findOneAndUpdate(data, { $set: update_data });
  }

  //************************************************* */
  //********[CREATE-OFFER]*******/
  async createOffer(offer: create_Offer_Body) {
    return await (await this.OfferModel.create(offer)).save();
  }
  async acceptOffer(accept_Data: accept_Offer_Body) {
    try {
      const offer_msg = await this.updateOffer(
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
  async getOffer(offer_Data: any): Promise<any> {
    return await this.OfferModel.findOne(offer_Data);
  }
  async getAllOffers(saleData: get_all_offers_Body) {
    return await this.OfferModel.find({ sale_id: saleData.sale_id });
  }
  async updateOffer(offer_data: Object, update_data: Object) {
    return await this.OfferModel.findOneAndUpdate(offer_data, {
      $set: update_data,
    });
  }
  // *************************/
  async declareWinner(auction_details: any) {
    //currently its a demo version need to add actual functionality later
    console.log('from declare winner', auction_details);
    let data = await this.BidModel.find({
      auction_id: auction_details.auction_id,
    })
      .sort({ bid_amount: -1, created_at: -1 })
      .limit(1);
    console.log('data from winner function', data);
    const contract_address = auction_details.contract_address;
    const token_id = auction_details.token_id;
    // return data;
    //  Need to test block chain Integration
    if (data.length) {
      const nftContractAddress = data[0]['contract_address'];
      const nftCntr = await this.ContractModel.findOne({
        contract_address: nftContractAddress,
      });
      const tokenDetails = await this.NftModel.findOne({
        contract_address: auction_details.contract_address,
        token_id: auction_details.token_id,
      });
      const token_owner = tokenDetails.token_owner;

      const marketplaceAddress = process.env.MARKETPLACE_CONTRACT_ADDRESS;
      const erc20Address = process.env.ERC20_TOKEN_ADDRESS;
      //ethers code contractFactory
      const marketplaceCntr = new ethers.Contract(
        marketplaceAddress,
        marketplaceAbi,
        wallet,
      );
      const bidder_address = data[0]['bidder_address'];
      const bid_amount = ethers.utils.parseUnits(
        data[0]['bid_amount'],
        'ether',
      );
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
        '\nnft owner address',
        nftCntr.owner_address,
      );
      const createSale = await marketplaceCntr.createSale(
        erc20Address,
        contract_address,
        bidder_address,
        parseInt(token_id),
        token_owner,
        nftCntr.owner_address,
        bid_amount
      );
      const res = await createSale.wait();
      console.log('res from create sale', res);
      if (!res) {
        return false;
      }
      // validate Nft
      const nft_data = await this.GetNft({
        token_id,
        token_owner,
      });
      if (!nft_data) {
        return 'You are not owner of the NFT';
      }

      //  All validations are done , now we are transferring the nft
      // ********* please add block chain code to transfer NFT

      // *********

      const dbmsg = await this.update_nft(
        {
          contract_address: nft_data.contract_address,
          token_id: nft_data.token_id,
        },
        { token_owner: data[0].bidder_address },
      );

      //update status to bid and auction add winner also
      // update after auction ,set auction status to false
      console.log('winner Data', dbmsg);
      // const winner_address = ;
      await this.update_nft(
        {
          contract_address: contract_address,
          token_id: token_id,
        },
        { is_in_auction: false },
      );
      const winner_data = bidder_address || 'nobids';

      // const winner_info =
      //   winnerdata.length === 0
      //     ? 'No bids for this auction'
      //     : ;
      // console.log(winner_info);
      // update bids of the auction
      await this.updateAllbids(
        {
          contract_address,
          token_id,
          status: 'started',
        },
        { status: 'AuctionExpired', is_auction_ended: true },
      );
      // After auction this cron job will be deleted // need to fix with unique id
      this.Cron_job.deleteCron(`${contract_address}${token_id}`);

      await this.update_auction(
        {
          contract_address: contract_address,
          token_id: token_id,

          status: 'started',
          // can add more validations if you want
        },
        { status: 'expired', winner: winner_data },
      );
      return data;
    }
    return [];
  }

  async GetNft(details: any): Promise<any> {
    console.log('From service', details);
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
  async getAuction(details: any): Promise<any> {
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

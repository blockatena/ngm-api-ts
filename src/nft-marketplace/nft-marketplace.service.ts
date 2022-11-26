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
@Injectable()
export class NftMarketplaceService {
  constructor(
    private configService: ConfigService,
    private nftService: NftService,
    @InjectModel(ContractSchema.name)
    private ContractModel: Model<ContractDocument>,
    @InjectModel(AuctionSchema.name)
    private AuctionModel: Model<AuctionDocument>,
    @InjectModel(BidSchema.name) private BidModel: Model<BidDocument>,
    @InjectModel(SalesSchema.name) private SalesModel: Model<SalesDocument>,
    @InjectModel(OfferSchema.name) private OfferModel: Model<OfferDocument>,
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
      const auction_data = await this.getAuction({
        contract_address,
        token_id,
        status: 'started',
        // need to add one more ,which is date
      });
      this.nftService.updateNft(
        {
          contract_address: auction_data.contract_address,
          token_id: auction_data.token_id,
        },
        { is_in_auction: false },
      );
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
        contact: 'emailaddress@gmail.com',
      };
    }
  }
  /************[GET BIDS FOR AUCTION]**********/
  async getBidsForAuction(bid: GetBids): Promise<any> {
    try {
      const { contract_address, token_id } = bid;
      const bid_data = await this.BidModel.find({ contract_address, token_id });
    } catch (error) { }
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
  /******************[CREATE SALE]**************/
  async createSale(sale: CreateSaleBody): Promise<any> {
    const { contract_address, token_id, token_owner } = sale;
    try {
      // save in DB
      const save_in_db = await this.SalesModel.create(sale);
      //update in nft is in auction is true
      const update_nft = await this.nftService.updateNft(
        { contract_address, token_id },
        { is_in_sale: true },
      );
      return save_in_db;
    } catch (error) {
      console.log(error);
      return { message: 'something wrong in DB' };
    }

  }
  async cancelSale(cancel: CancelSaleBody): Promise<any> {
    const { contract_address, token_id } = cancel;
    try {
      //update status of the sale
      const sales_update = await this.updateSale(
        {
          contract_address,
          token_id, status: 'started'
        },
        { status: 'cancelled' },
      );
      // offers schema needs to be updated
      // ********
      // 
      const nft_update = await this.nftService.updateNft(
        {
          contract_address,
          token_id
        },
        { is_in_sale: false },
      );
      return sales_update;
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
  async updateSale(data: any, update_data: any): Promise<any> {
    try {
      await this.SalesModel.findOneAndUpdate(data, { $set: update_data });
    } catch (error) {
      console.log(error);
      return {

      }
    }

  }

  //************************************************* */
  //********[MAKE-OFFER]*******/
  async makeOffer(offer: MakeOfferBody): Promise<any> {
    try {
      return await this.OfferModel.create(offer);
    } catch (error) {
      console.log(error);
      return {
        message: 'Somethign went wrong'
      }
    }
  }
  async acceptOffer(accept_Data: AcceptOfferBody): Promise<any> {
    const { contract_address, token_id, token_owner, offer_person_address } = accept_Data;
    try {
      const marketplaceAddress = process.env.MARKETPLACE_CONTRACT_ADDRESS;
      const erc20Address = process.env.ERC20_TOKEN_ADDRESS;
      //ethers code contractFactory
      const marketplaceCntr = new ethers.Contract(
        marketplaceAddress,
        marketplaceAbi,
        this.wallet,
      );
      //
      const nftCntr = await this.ContractModel.findOne({
        contract_address,
      });
      const offer_details = await this.OfferModel.findOne({ contract_address, token_id, offer_person_address, offer_status: 'started' });
      const createSale = await marketplaceCntr.createSale(
        erc20Address,
        contract_address,
        offer_person_address,
        parseInt(token_id),
        token_owner,
        nftCntr.owner_address,
        offer_details.offer_price,
      );
      const res = await createSale.wait();
      console.log('res from create sale', res);
      if (!res) {
        return false;
      }
      // validate Nft
      const nft_data = await this.nftService.getNft({
        token_id,
        contract_address,
      });
      if (!nft_data) {
        return 'You are not owner of the NFT';
      }

      //


      const offer_msg = await this.updateOffer(
        {},
        { offer_status: 'accepted' },
      );
      /*
      block chain code
      */
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
  async getAllOffers(saleData: GetAllOffersBody) {
    try {
      return await this.OfferModel.find({ sale_id: saleData.sale_id }).sort({ offer_price: -1, createdAt: -1 });
    } catch (error) {
      console.log(error);
      return {
        message: "something went wrong",
        error
      }
    }
  }
  async updateOffer(offer_data: Object, update_data: Object) {
    try {
      return await this.OfferModel.findOneAndUpdate(offer_data, {
        $set: update_data,
      });
    } catch (error) {
      console.log(error);
      return {
        message: "something went wrong",
        error
      }
    }
  }
  // *************************/
  async declareWinner(auction_details: any): Promise<any> {
    //currently its a demo version need to add actual functionality later
    try {
      console.log('from declare winner', auction_details);
      let data = await this.BidModel.find({
        auction_id: auction_details._id,
        status: 'started',
      })
        .sort({ bid_amount: -1, created_at: -1 })
        .limit(1);
      console.log('data from winner function', data);
      const contract_address = auction_details.contract_address;
      const token_id = auction_details.token_id;
      // return data;
      //  Need to test block chain Integration
      this.nftService.updateNft(
        {
          contract_address: auction_details.contract_address,
          token_id: auction_details.token_id,
        },
        { is_in_auction: false },
      );
      const success_data = await this.updateAuction(
        {
          _id: auction_details._id,
          contract_address,
          token_id,
          status: 'started',
        },
        { status: 'expired' },
      );
      //update in all bids
      console.log('*************');
      console.log('bidsdata', data);

      console.log('*************');
      //
      if (data.length) {
        const nftContractAddress = data[0]['contract_address'];
        const nftCntr = await this.ContractModel.findOne({
          contract_address: nftContractAddress,
        });
        const tokenDetails = await this.nftService.getNft({
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
          this.wallet,
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
          bid_amount,
        );
        const res = await createSale.wait();
        console.log('res from create sale', res);
        if (!res) {
          return false;
        }
        // validate Nft
        const nft_data = await this.nftService.getNft({
          token_id,
          contract_address,
        });
        if (!nft_data) {
          return 'You are not owner of the NFT';
        }

        //  All validations are done , now we are transferring the nft
        // ********* please add block chain code to transfer NFT

        // *********
        console.log('_________________________');
        console.log('NFT DATA', nft_data);
        console.log('_________________________');
        const dbmsg = await this.nftService.updateNft(
          {
            contract_address: nft_data.contract_address,
            token_id: nft_data.token_id,
          },
          { token_owner: data[0].bidder_address, is_in_auction: false },
        );

        console.log('_________________________________');
        console.log('New Owner info Updtae', dbmsg);
        console.log('_________________________________');

        //update status to bid and auction add winner also
        // update after auction ,set auction status to false
        console.log('winner Data', dbmsg);
        // const winner_address = ;
        // await this.update_nft(
        //   {
        //     contract_address: contract_address,
        //     token_id: token_id,
        //   },
        //   { is_in_auction: false },
        // );
        const winner_data = bidder_address || 'nobids';

        // const winner_info =
        //   winnerdata.length === 0
        //     ? 'No bids for this auction'
        //     : ;
        // console.log(winner_info);
        // update bids of the auction
        await this.updateAllBids(
          {
            contract_address,
            token_id,
            status: 'started',
          },
          { status: 'AuctionExpired', is_auction_ended: true },
        );
        // After auction this cron job will be deleted // need to fix with unique id
        // this.Cron_job.deleteCron(`${contract_address}${token_id}`);

        await this.updateAuction(
          {
            contract_address: contract_address,
            token_id: token_id,

            status: 'started',
            // can add more validations if you want
          },
          { status: 'expired', winner: winner_data },
        );
        // updatind all bids
        await this.updateAllBids(
          {
            contract_address,
            token_id,
            status: 'started',
          },
          { status: 'expired' },
        );
        //

        return data;
      }
      return [];
    } catch (error) {
      console.log(error);
      return {
        message: "something went wrong",
        error
      }
    }
  }

  //
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
        message: "something went wrong",
        error
      }
    }
  }

  async getAllNftsInAuction(): Promise<any> {
    try {
      return await this.nftService.getNft({ is_in_auction: true });
    } catch (error) {
      console.log(error);
      return {
        message: "something went wrong",
        error
      }
    }
  }
  async getAllNftsInSale(): Promise<any> {
    try {
      return await this.nftService.getNft({ is_in_sale: true });
    } catch (error) {
      console.log(error);
      return {
        message: "something went wrong",
        error
      }
    }
  }
  async getAuction(details: object): Promise<any> {
    try {
      console.log('on Service', details);
      return await this.AuctionModel.findOne(details);
    } catch (error) {
      console.log(error);
      return {
        message: "something went wrong",
        error
      }
    }
  }
  async getBid(details: any): Promise<any> {
    try {
      return await this.BidModel.findOne(details);
    } catch (error) {
      console.log(error);
      return {
        message: "something went wrong",
        error
      }
    }
  }
}

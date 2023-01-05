import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ContractDocument, ContractSchema } from 'src/schemas/contract.schema';
import { NftDocument, NftSchema } from 'src/nft/schema/nft.schema';

import {
  GetListedCollections,
  GetNftBody,
  GetSingleNftResponse,
  Paginate,
} from './nftitems/create-nft.dto';
import { AuctionSchema, AuctionDocument } from 'src/schemas/auction.schema';
import { BidSchema, BidDocument } from 'src/schemas/bid.schema';
import { GetUserNfts } from 'src/nft-marketplace/dtos/auctiondto/create-auction.dto';
import { ErrorHandler } from './utils/errorhandlers';
import { metadata, metadataDocument } from './schema/metadata.schema';
import { GetCollectionBody, GetUserOwnedCollections } from './nftitems/collections.dto';
const { log } = console;
@Injectable()
export class NftService {
  constructor(
    @InjectModel(ContractSchema.name)
    private ContractModel: Model<ContractDocument>,
    private readonly httpService: HttpService,
    @InjectModel(NftSchema.name) private NftModel: Model<NftDocument>,
    @InjectModel(metadata.name) private MetadataModel: Model<metadataDocument>,
    @InjectModel(AuctionSchema.name)
    private AuctionModel: Model<AuctionDocument>,
    @InjectModel(BidSchema.name) private BidModel: Model<BidDocument>,
  ) {
    NftModel;
    BidModel;
    AuctionModel;
    MetadataModel;
    ContractModel;
  }
  async getMetadata(cid: string, ipfsFlag: boolean): Promise<any> {
    return await this.httpService.axiosRef.get(
      ipfsFlag ? 'https://ipfs.io/ipfs/' + cid : cid,
    );
  }

  getImageUrl(url: string): string {
    return url.includes('ipfs://')
      ? 'https://ipfs.io/ipfs/' + url.split('ipfs://')[1]
      : url;
  }

  tokeninfo() {
    return { msg: 'Metadata Fetched' };
  }
  async createNft(data: any): Promise<any> {
    try {
      return await (await this.NftModel.create(data)).save();
    } catch (error) {

    }

  }
  // To get all Nfts
  async getAllNfts(page_details: Paginate): Promise<any> {
    const { page_number, items_per_page } = page_details;
    try {
      const nfts = await this.NftModel.find({})
        .limit(items_per_page * 1)
        .skip((page_number - 1) * items_per_page)
        .exec();
      const count = await this.NftModel.countDocuments();
      return {
        totalpages: Math.ceil(count / items_per_page),
        currentPage: page_number,
        nfts,
      };
    } catch (error) {
      console.log(error);
      return { message: 'Something went wrong' };
    }
  }

  async getUserNfts(body: GetUserNfts) {
    const { token_owner, items_per_page,
      page_number } = body;
    try {
      const nfts = await this.NftModel.find({ token_owner })
        .limit(items_per_page * 1)
        .skip((page_number - 1) * items_per_page)
        .exec();
      return nfts.length > 0 ? nfts : 'You dont have any Assets';
    } catch (error) {
      console.log(error);
      return {
        message: 'Something went wrong',
      };
    }
  }
  // To get single Nft
  async getNft(data: any): Promise<any> {
    try {
      const nft = await this.NftModel.findOne({ ...data });
      const contract_details = await this.getContract(data.contract_address);
      return { contract_details, nft };
    } catch (error) {
      console.log(error);
      return { message: 'Something went Wrong' };
    }
  }
  // To get Nfts which are listed
  async getNftsListed(listed: string): Promise<any> {
    try {
      if (listed == 'auction')
        return await this.NftModel.find({ is_in_auction: true });
      if (listed == 'sale')
        return await this.NftModel.find({ is_in_sale: true });
    } catch (error) {
      return {
        error,
        message: 'Something went wrong in service',
      };
    }
  }

  async getCountNfts(contract_address: string): Promise<any> {
    try {
      return await this.NftModel.countDocuments({ contract_address });
    } catch (error) {
      console.log(error);
      return { message: 'Something went Wrong' };
    }
  }

  async getNftsOwned(
    user_address: string,
    contract_address: string,
  ): Promise<any> {
    try {
      return await this.NftModel.find({
        token_owner: user_address,
        contract_address: contract_address,
      });
    } catch (error) {
      console.log(error);
      return {
        message: 'something went wrong in service',
        error,
      };
    }
  }
  async getCollections(body: GetCollectionBody) {
    const { page_number, items_per_page } = body;
    try {
      const collections = await this.ContractModel.find({}).limit(items_per_page * 1).skip((page_number - 1) * items_per_page)
        .exec();
      const total_collections = await this.ContractModel.countDocuments();
      console.log(total_collections);
      return {
        total_collections,
        total_pages: Math.ceil(total_collections / items_per_page),
        currentPage: page_number,
        collections
      }
    } catch (error) {
      console.log(error);
      return {
        message: 'something went wrong',
        error,
      }
    }

  }
  async getNftsByCollection(contract_address: string): Promise<any> {
    try {
      return await this.NftModel.aggregate([
        { $match: { contract_address } },
        {
          $lookup: {
            from: 'auctionschemas',
            let: {
              contract_address: '$contract_address',
              token_id: '$token_id',
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      {
                        $eq: ['$contract_address', '$$contract_address'],
                      },
                      {
                        $eq: ['$token_id', '$$token_id'],
                      },
                    ],
                  },
                  status: 'started',
                },
              },
            ],
            as: `auction`,
          },
        },
      ]);
    } catch (error) { }
  }

  async getNftssListed(data: GetListedCollections): Promise<any> {
    const {
      contract_address,
      token_owner,
      listed_in,
      page_number,
      items_per_page,
      order,
      alphabetical_order,
    } = data;
    try {
      console.log(
        contract_address, token_owner,
        listed_in,
        page_number,
        items_per_page,
        order,
        alphabetical_order,
      );
      const alpha_order = alphabetical_order == 'ZtoA' ? -1 : 1;

      const recent = order == 'NewToOld' ? -1 : 1;
      console.log(recent, alpha_order);
      const condition = {};
      if (listed_in) {
        condition[`filter`] =
          listed_in == 'auction'
            ? { is_in_auction: true }
            : { is_in_sale: true };
      }
      if (contract_address) {
        condition[`contract_address`] = contract_address;
      }
      if (token_owner) {
        condition[`token_owner`] = token_owner;
      }
      const sort_order = {};
      if (order) {
        sort_order['createdAt'] = recent;
      }
      if (alphabetical_order) {
        sort_order['meta_data.name'] = alpha_order;
      }
      console.log(sort_order);
      console.log('condition', condition);
      const nfts = await this.NftModel.find(condition)
        .sort({ ...sort_order })
        .limit(items_per_page * 1)
        .skip((page_number - 1) * items_per_page)
        .exec();

      const total_nfts = await this.NftModel.find(condition).countDocuments();
      return {
        total_nfts,
        total_pages: Math.ceil(total_nfts / items_per_page),
        currentPage: page_number,
        nfts,
      }
    } catch (error) {
      console.log(error);
      return { message: 'something went wrong', error };
    }
  }
  async getUniqueOwners(contract_address: string): Promise<any> {
    try {
      return await this.NftModel.distinct('token_owner', {
        contract_address: contract_address,
      });
    } catch (error) {
      console.log(error);
      return { message: 'Something went Wrong ,Our team is Looking into it' };
    }
  }

  async getCollectionOnly(contract_address: string): Promise<any> {
    try {
      return await this.NftModel.find({ contract_address });
    } catch (error) {

    }
  }


  async getContract(contract_address: any): Promise<any> {
    console.log(contract_address, 'From Service');
    return await this.ContractModel.findOne({ contract_address });
  }
  async getCollectionsOwned(user: GetUserOwnedCollections): Promise<any> {
    const { owner_address, items_per_page, page_number } = user;
    try {
      const collections = await this.ContractModel.find({ owner_address }).sort({ createdAt: -1 }).limit(items_per_page * 1)
        .skip((page_number - 1) * items_per_page);
      log(collections);
      const total = await this.ContractModel.count({ owner_address });
      return {
        total,
        current_page: page_number,
        items_per_page,
        collections
      }
    } catch (error) {
      log(error);
      return {
        message: 'something went wrong',
        error
      }
    }
  }
  // Count Collections
  async countCollections(condition: any): Promise<any> {
    try {
      return await this.ContractModel.count({ ...condition });
    } catch (error) {
      log(error)
      return {
        error
      }
    }
  }
  async pushImagesToCollection(contract_address: string, image_uri: string) {
    return await this.ContractModel.findOneAndUpdate(
      {
        contract_address,
      },
      { $push: { imageuri: image_uri } },
    );
  }
  async getAuction(body: GetNftBody): Promise<any> {
    const { contract_address, token_id } = body;
    try {
      return await this.AuctionModel.findOne({
        contract_address,
        token_id,
        status: 'started',
      });
    } catch (error) {
      console.log(error);
      return {
        message: 'Something went wrong in service',
      };
    }
  }
  //
  async getBids(auction_id: string): Promise<any> {
    try {
      console.log('From Get All bids', auction_id);
      return await this.BidModel.find({
        auction_id,
        status: 'started',
      }).sort({ bid_amount: -1 });
    } catch (error) { }
  }
  async getSale(): Promise<any> {
    try {
    } catch (error) { }
  }
  async pushTokenUriToDocArray(
    contract_address: string,
    tokenUri: string,
    tokenId: number,
    contract_type: string,
    chain: object, //will use it later
  ) {
    const doc = await this.MetadataModel.findOne({
      contract_address,
      contract_type,
      chain,
    });

    if (doc) {
      const doc = await this.MetadataModel.findOneAndUpdate(
        {
          contract_address,
          contract_type,
          chain,
        },
        {
          $addToSet: {
            tokenUri: { tokenId, uri: tokenUri },
          },
        },
      );
      return doc;
    } else {
      const metadata = await this.MetadataModel.create({
        contract_address,
        contract_type,
        tokenUri: [{ tokenId, uri: tokenUri }],
        chain,
      });
      return metadata;
    }
  }
  //  Update Nft Info
  async updateNft(data: any, update_data: any): Promise<any> {
    try {
      return await this.NftModel.findOneAndUpdate(data, {
        $set: update_data,
      });
    } catch (error) {
      console.log(error)

      return {
        message: "something went Wrong",
        error
      }
    }
  }

  async updateMany(data: any, update_data: any): Promise<any> {
    return await this.ContractModel.updateMany({ data }, {
      $set: update_data,
    })
  }
  /*****************[TO_GET_A_SINGLE_NFT]*******************************/
  async getSingleNft(data: object): Promise<any> {
    try {
      return await this.NftModel.findOne(data);
    } catch (error) {
      return {
        success: false,
        message: 'Something went wrong in getSingleNft Service',
        error,
      };
    }
  }
}

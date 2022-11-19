import { HttpService } from '@nestjs/axios';
import { Body, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ContractDocument, ContractSchema } from 'src/schemas/contract.schema';
import { NftDocument, NftSchema } from 'src/schemas/nft.schema';
import { metadataDocument, metadata } from 'src/schemas/metadata.schema';
import {
  createNFT,
  GetBids,
  GetListedCollections,
  getNft,
  GetNftBody,
  paginate,
} from './nftitems/createNft.dto';
import { AuctionSchema, AuctionDocument } from 'src/schemas/auction.schema';
import { BidSchema, BidDocument } from 'src/schemas/bid.schema';
import { GetUserNfts } from 'src/nft-marketplace/dtos/auctiondto/create-auction.dto';

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
  async createNFT(data: any): Promise<any> {
    return await (await this.NftModel.create(data)).save();
  }
  // To get all Nfts
  async GetAllNfts(page_details: paginate): Promise<any> {
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
    const { token_owner } = body;
    try {
      return await this.NftModel.find({ token_owner });
    } catch (error) {
      console.log(error);
      return {
        message: 'Something went wrong',
      };
    }
  }
  // To get single Nft
  async GetNft(data: GetNftBody): Promise<any> {
    try {
      const nft = await this.NftModel.findOne(data);
      const contract_details = await this.GetContract({
        contract_address: data.contract_address,
      });

      return { contract_details, nft };
    } catch (error) {
      console.log(error);
      return { message: 'Something went Wrong' };
    }
  }
  async GetNftsListed(listed: string): Promise<any> {
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

  async GetDetails(): Promise<any> {
    return {
      auction: this.getAuction,
      bids: this.getBids,
    };
  }

  async GetNftsOwned(): Promise<any> {
    try {
    } catch (error) {
      console.log(error);
      return {
        message: 'something went wrong in service',
        error,
      };
    }
  }
  async getcollections() {
    return await this.ContractModel.find({});
  }
  async get_Nfts_by_Collection(Contract_Address: string): Promise<any> {
    return await this.NftModel.find({ contract_address: Contract_Address });
  }
  async GetNftssListed(data: GetListedCollections): Promise<any> {
    const {
      contract_address,
      listed_in,
      page_number,
      items_per_page,
      order,
      alphabetical_order,
    } = data;
    try {
      console.log(
        contract_address,
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
      const sort_order = {};
      if (order) {
        sort_order['createdAt'] = recent;
      }
      if (alphabetical_order) {
        sort_order['meta_data.name'] = alpha_order;
      }
      console.log(sort_order);
      console.log('condition', condition);
      return await this.NftModel.find(condition)
        .sort({ ...sort_order })
        .limit(items_per_page * 1)
        .skip((page_number - 1) * items_per_page)
        .exec();
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
  async GetContract(contract_address: any): Promise<any> {
    console.log(contract_address, 'From Service');
    return await this.ContractModel.findOne(contract_address);
  }
  async PushImagesToCollection(contract_address: string, image_uri: string) {
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
  async getBids(auction_id: string): Promise<any> {
    try {
      console.log('From Get All bids', auction_id);
      return await this.BidModel.find({
        auction_id,
        status: 'started',
      }).sort({ bid_amount: -1 });
    } catch (error) {}
  }
  async getSale(): Promise<any> {
    try {
    } catch (error) {}
  }
  async pushTokenUriToDocArray(
    contract_address: string,
    tokenUri: string,
    tokenId: number,
    contract_type: string,
    chain = 'Polygon', //will use it later
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
}

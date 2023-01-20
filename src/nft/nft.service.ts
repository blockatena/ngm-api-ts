import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
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
import { GetAssets, GetCollectionBody, GetUserOwnedAssets } from './nftitems/collections.dto';
import { Nft1155Document, Nft1155Schema } from './schema/nft.1155.schema';
import { Nft1155OwnerSchema, Nft1155OwnerDocument } from 'src/schemas/user-1155.schema';
import { GetNft1155, GetTokensUserHold } from './nftitems/get-nft-1155';
import { UpdateTokens } from './nftitems/update-tokens';
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
    @InjectModel(Nft1155Schema.name) private Nft11555Model: Model<Nft1155Document>,
    @InjectModel(Nft1155OwnerSchema.name) private Nft1155OwnerModel: Model<Nft1155OwnerDocument>
  ) {
    NftModel;
    BidModel;
    AuctionModel;
    MetadataModel;
    ContractModel;
    Nft11555Model;
    Nft1155OwnerModel;
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
      return await this.NftModel.create(data);
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
  // Get Nfts By Collection
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
    } catch (error) {
      return { success: false, message: "Something went Wrong", error }
    }
  }
  /****[GET_NFTS_LISTED]*/
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

      if (!listed_in && !contract_address && !token_owner) {
        return {
          success: false,
          message: 'Required Fields need to be Provided',
        }
      }
      if (listed_in) {
        if (listed_in === 'auction') {
          condition[`is_in_auction`] = true;
        }
        if (listed_in === 'sale') {
          condition[`is_in_sale`] = true;
        }
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
      return {
        message: 'something went wrong',
        error
      }
    }
  }


  async getContract(contract_address: any): Promise<any> {
    console.log(contract_address, 'From Service');
    return await this.ContractModel.findOne({ contract_address });
  }
  async getCollectionsOwned(user: GetUserOwnedAssets): Promise<any> {
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
        message: 'something went wrong',
        error
      }
    }
  }
  // Count Assets by User
  async count1155Assets(wallet_address: string): Promise<any> {
    try {
      return await this.Nft1155OwnerModel.countDocuments({ token_owner: wallet_address });
    } catch (error) {
      log(error);
      return {
        success: false,
        message: "Something Went Wrong",
        error
      }
    }
  }
  // Get Limits
  async checKLimit(asset_limit: number, token_owner: string): Promise<any> {

    //  Only the Contract-Owner should Mint
    // Limit
    const get_721_count = await this.count721Assets(token_owner)
    const get_1155_count = await this.count1155Assets(token_owner);
    const total_count = Number(get_721_count) + Number(get_1155_count);

    log(`1155 Count: ${get_1155_count}  \n 
   721 Count  ${get_721_count} \n 
     total=  ${total_count}  \n
     ${asset_limit}  `)

    const condition = Number(total_count) > Number(asset_limit)
    console.log(condition);
    if (condition) {
      log('exceeded');
      return {
        permit: false,
        message: `Hello ${token_owner} you have Exceeded you Limit Your current_limit for Assets :  ${asset_limit}
       Your current Nfts ${total_count}`
      };
    }
    return { permit: true }
  }


  async count721Assets(wallet_address: string): Promise<any> {
    try {
      return await this.NftModel.countDocuments({ token_owner: wallet_address });
    } catch (error) {
      log(error);
      return {
        success: false,
        message: "Something Went Wrong",
        error
      }
    }
  }


  // 
  // Push Images to token 
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
        error
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
    } catch (error) {
      return {
        message: 'Something went wrong in service',
        error
      };
    }
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

  // Store 1155
  async create1155Nft(arrdb: any): Promise<any> {
    try {
      return await this.Nft11555Model.create(arrdb);
    } catch (error) {
      return {
        success: false,
        message: 'Something went wrong in  Service',
        error,
      }
    }
  }
  //Get 1155
  async get1155Nft(getNft1155: GetNft1155): Promise<any> {
    const { contract_address, token_id } = getNft1155;
    try {
      return await this.Nft11555Model.findOne({ contract_address, token_id });
    } catch (error) {
      return {
        success: false,
        message: 'Something went wrong in  Service',
        error,
      }
    }
  }

  /********[GET 1155 NFTS]*********/
  async get1155Nfts(getListedCollections: GetAssets): Promise<any> {
    const { contract_address, page_number, items_per_page, order, listed_in, alphabetical_order } = getListedCollections;
    try {
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
      const nfts = await this.Nft11555Model.find(condition)
        .sort({ ...sort_order })
        .limit(items_per_page * 1)
        .skip((page_number - 1) * items_per_page)
        .exec();
      const total_nfts = await this.Nft11555Model.find(condition).countDocuments();
      return {
        collection: await this.getContract(contract_address),
        total_nfts,
        total_pages: Math.ceil(total_nfts / items_per_page),
        currentPage: page_number,
        nfts,
      }
    } catch (error) {
      log(error)
      return {
        success: false,
        error,
        message: "Something Went Wrong"
      }
    }
  }

  // get 1155 nft along with its owner
  async get1155NftOwners(getNft1155: GetNft1155): Promise<any> {
    const { contract_address, token_id } = getNft1155;
    try {
      return await this.Nft1155OwnerModel.find({ contract_address, token_id });
    } catch (error) {
      return {
        success: false,
        message: 'Something went wrong in  Service',
        error,
      }
    }
  }
  // get number of tokens does user hold
  async getTokensUserHold(getTokensUserHold: GetTokensUserHold): Promise<any> {
    const { contract_address, token_id, token_owner } = getTokensUserHold;
    try {
      const check_nft_exists = await this.get1155Nft({ contract_address, token_id });
      if (!check_nft_exists) {
        return `There is no Asset with ${contract_address} and ${token_id}`
      }
      //  check he ownes nft or not 
      // getting all owners
      const get_owners = await this.get1155NftOwners({ contract_address, token_id });

      // check owner exists or not
      const is_owner_exists = get_owners.find(owner => owner.token_owner === token_owner);
      console.log(is_owner_exists);

      if (!is_owner_exists) {
        return `${token_owner} doesnt hold this ${contract_address} ${token_id}`;
      }
      return { tokens: is_owner_exists.number_of_tokens };
    } catch (error) {
      log(error)
      return {
        message: `something went wrong`,
      }
    }
  }


  // update user Tokens
  async updateTokens(updateTokens: UpdateTokens): Promise<any> {
    const { contract_address, token_id, _tokens, token_owner, operation } = updateTokens;
    try {
      if (operation === "INCREMENT")
        return await this.Nft1155OwnerModel.updateOne({ contract_address, token_id, token_owner }, { $inc: { number_of_tokens: _tokens } })
      else
        return await this.Nft1155OwnerModel.updateOne({ contract_address, token_id, token_owner }, { $dec: { number_of_tokens: _tokens } });

    } catch (error) {
      log(error);
      return {
        success: false,
        message: `Something went Wrong`,
        error
      }
    }
  }

  // 
  async get1155NftByOwner(getUserOwnedAssets: GetUserOwnedAssets): Promise<any> {
    const { owner_address, page_number, items_per_page } = getUserOwnedAssets;
    try {
      log(getUserOwnedAssets);
      return await this.Nft1155OwnerModel.find({ token_owner: owner_address }).sort({ createdAt: -1 }).limit(items_per_page * 1).skip((page_number - 1) * items_per_page);

    } catch (error) {
      return {
        success: false,
        message: 'Something went wrong in  Service',
        error,
      }
    }
  }
  // 

  async create1155NftOwner(arrdb: any): Promise<any> {
    try {
      return await this.Nft1155OwnerModel.create(arrdb);
    } catch (error) {
      return {
        success: false,
        message: 'Something went wrong in  Service',
        error,
      }
    }
  }
}

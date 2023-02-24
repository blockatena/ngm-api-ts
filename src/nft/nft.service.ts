import { HttpService } from '@nestjs/axios';
import { ConsoleLogger, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NftDocument, NftSchema } from 'src/nft/schema/nft.schema';

import {
  GetListedCollections,
  GetNftBody,
  GetSingleNftResponse,
  Paginate,
} from './dtos/create.nft.dto';
import { AuctionSchema, AuctionDocument } from 'src/marketplace/schema/auction.schema';
import { GetUserNfts } from 'src/marketplace/dtos/auctiondto/create-auction.dto';
import { ErrorHandlerType } from 'src/utils/errorhandlers/error.handler';
import { metadata, metadataDocument } from './schema/metadata.schema';
import { GetAssets, GetCollectionBody, GetUserOwnedAssets } from './dtos/collections.dto';
import { Nft1155Document, Nft1155Schema } from './schema/nft.1155.schema';
import { GetNft1155, GetTokensUserHold, get1155nft, GetAssetByUser } from './dtos/getnft1155.dto';
import { UpdateTokens } from './dtos/updatetokens';
import { UpdateOwner } from './dtos/address.dto';
import { BidDocument, BidSchema } from 'src/marketplace/schema/bid.schema';
import { Nft1155OwnerDocument, Nft1155OwnerSchema } from 'src/nft/schema/user1155.schema';
import { ContractSchema, ContractDocument } from 'src/deployment/schema/contract.schema';
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
      // 
      return await this.NftModel.create(data);
    } catch (error) {

    }

  }
  // ADDING OWNER
  async addOwner(updateOwner: UpdateOwner): Promise<any> {
    const { contract_address, token_owner } = updateOwner;
    try {
      return await this.ContractModel.updateOne({ contract_address }, { $addToSet: { unique_owners: token_owner } });
    } catch (error) {
      log(error)
      return {
        success: false,
        message: "Something went wrong in add Owner Service",
        error
      }
    }
  }
  // REMOVING OWNER
  async removeOwner(updateOwner: UpdateOwner): Promise<any> {
    const { contract_address, token_owner } = updateOwner;
    try {
      return await this.ContractModel.updateOne({ contract_address }, { $unset: { unique_owners: token_owner } });
    } catch (error) {
      log(error)
      return {
        success: false,
        message: "Something went wrong in add Owner Service",
        error
      }
    }
  }

  // To get all Nfts
  async getAllNfts(page_details: Paginate): Promise<any> {
    // const { page_number, items_per_page, sort_by_date, sort_by_names } = page_details;
    const { page_number, items_per_page, sort_by, listed_in } = page_details;
    try {
      //createdAt
      //meta_data.name
      const filter = {}
      const body = {}

      console.log({ page_number, items_per_page, sort_by });
      if (sort_by !== "NA") {
        if (sort_by == "NEWTOOLD" || sort_by == "OLDTONEW") {
          filter[`createdAt`] = sort_by === "NEWTOOLD" ? -1 : 1;
        } else if (sort_by == "ATOZ" || sort_by == "ZTOA") {
          filter["meta_data.name"] = sort_by === "ATOZ" ? 1 : -1
        }
      }

      if (listed_in !== "NA") {
        if (listed_in == "AUCTION") {
          body["is_in_auction"] = true;
        } else if (listed_in == "SALE") {
          body["is_in_sale"] = true;
        }
      }
      // console.log({ page_number, items_per_page, sort_by_date, sort_by_names });
      // if (!(sort_by_date === "NOTREQUIRED")) {
      //   filter[`createdAt`] = sort_by_date === "NEWTOOLD" ? -1 : 1;
      //   //filter[`createdAt`] = sort_by_date;
      //   console.log("ONLY DATE SORT \n", sort_by_date);

      // }
      // if (!(sort_by_names === "NOTREQUIRED")) {
      //   filter["meta_data.name"] = sort_by_names === "ATOZ" ? 1 : -1
      //   // filter["meta_data.name"] = sort_by_names;
      //   console.log("ONLY ALPHA SORT \n", sort_by_names);
      // }
      console.log("FILTER \n", filter);
      console.log("BODY \n", body);

      const nfts = await this.NftModel.find(body)
        .sort(filter)
        .limit(items_per_page * 1)
        .skip((page_number - 1) * items_per_page)
        .exec();
      const count = await this.NftModel.countDocuments(body);
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
    const { page_number, items_per_page, sort_by, chain, type } = body;
    try {

      if(Number.isNaN(page_number)) {
        body.page_number = 1;
      }
      const filter = {}
      let findData = {}
      const ENVIRONMENT = process.env.ENVIRONMENT

      console.log({ page_number, items_per_page, sort_by , chain, type});
      if (sort_by !== "NA") {
        if (sort_by == "NEWTOOLD" || sort_by == "OLDTONEW") {
          filter[`createdAt`] = sort_by === "NEWTOOLD" ? -1 : 1;
        } else if (sort_by == "ATOZ" || sort_by == "ZTOA") {
          filter["collection_name"] = sort_by === "ATOZ" ? 1 : -1
        }
      }

      if (chain !== "NA") {
        if(ENVIRONMENT == "DEV") {
          if(chain == 'MUMBAI' || chain == 'GOERLI' || chain == "HYPERSPACE") {
            findData[`chain.id`] = chain == 'MUMBAI'?80001:chain=="GOERLI"?5:3141;
          } 
        } else
        {
          if(chain == 'ETHEREUM' || chain == 'POLYGON' || chain == "FILECOIN") {
            findData[`chain.id`] = chain =='POLYGON'?137:chain=="ETHEREUM"?1:314;
          }
        }
      }

      if (type !== "NA") {
          if(type == 'ERC1155') {
            findData[`type`] = 'NGM1155';
          }  else if(type == 'ERC721') {
            findData['type'] = {$nin:["NGM1155"]}
          } 
        } 

      console.log(findData)

      const collections = await this.ContractModel.find(findData)
        .sort(filter)
        .limit(items_per_page * 1)
        .skip((page_number - 1) * items_per_page)
        .exec();
      const total_collections = await this.ContractModel.countDocuments(findData);
      return {
        total_collections,
        totalpages: Math.ceil(total_collections / items_per_page),
        currentPage: page_number,
        collections,
      };
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
      address,
      address_type,
      listed_in,
      page_number,
      items_per_page,
      sort_by, search
    } = data;
    try {
      console.log(
        address,
        address_type,
        listed_in,
        page_number,
        items_per_page,
        sort_by,
        search
      );


      const filter = {}
      const body = {}

      console.log({ page_number, items_per_page, sort_by, search, listed_in, address, address_type });
      if (sort_by !== "NA") {
        if (sort_by == "NEWTOOLD" || sort_by == "OLDTONEW") {
          filter[`createdAt`] = sort_by === "NEWTOOLD" ? -1 : 1;
        } else if (sort_by == "ATOZ" || sort_by == "ZTOA") {
          filter["meta_data.name"] = sort_by === "ATOZ" ? 1 : -1
        }
      }
      if(address_type) {
        if(address_type =='USER') {
          body['token_owner'] = address;
        } else if(address_type == 'COLLECTION') {
          body['contract_address'] = address
        } else {
          return {
            message:'address and address type and required fields'
          }
        }
      }
      if (listed_in !== "NA") {
        if (listed_in == "AUCTION") {
          body["is_in_auction"] = true;
        } else if (listed_in == "SALE") {
          body["is_in_sale"] = true;
        }
      }

      if (search !== "NA") {

        body["meta_data.name"] = {$regex:`(?i)${search}`}
      }
      console.log(body)
      const nfts = await this.NftModel.find(body)
        .sort({ ...filter })
        .limit(items_per_page * 1)
        .skip((page_number - 1) * items_per_page)
        .exec();

      const total_nfts = await this.NftModel.find(body).countDocuments();
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
  async get1155Nfts(getListedCollections: GetListedCollections): Promise<any> {
    const {
      address,
      address_type,
      listed_in,
      page_number,
      items_per_page,
      sort_by,
      search
    }  = getListedCollections;
    try {
      const filter = {}
      const body = {}

      console.log({ page_number, items_per_page, sort_by });
      if (sort_by !== "NA") {
        if (sort_by == "NEWTOOLD" || sort_by == "OLDTONEW") {
          filter[`createdAt`] = sort_by === "NEWTOOLD" ? -1 : 1;
        } else if (sort_by == "ATOZ" || sort_by == "ZTOA") {
          filter["meta_data.name"] = sort_by === "ATOZ" ? 1 : -1
        }
      }
      if(address_type) {
        if(address_type =='USER') {
          body['token_owner'] = address;
        } else if(address_type == 'COLLECTION') {
          body['contract_address'] = address
        } else {
          return {
            message:'address and address type and required fields'
          }
        }
      }
      if (listed_in !== "NA") {
        if (listed_in == "AUCTION") {
          body["is_in_auction"] = true;
        } else if (listed_in == "SALE") {
          body["is_in_sale"] = true;
        }
      }

      if (search !== "NA") {
        body["meta_data.name"] = { $regex: `/^${search}/i` }
      }

      const nfts = await this.Nft11555Model.find(body)
        .sort({ ...filter })
        .limit(items_per_page * 1)
        .skip((page_number - 1) * items_per_page)
        .exec();
      const total_nfts = await this.Nft11555Model.find(body).countDocuments();
      return {
        // collection: await this.getContract(contract_address),
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
  //**********************[UNIQUE_OWNERS_1155]**********************/
  async uniqueOwners1155(contract_address: string): Promise<any> {
    try {
      return await this.Nft1155OwnerModel.distinct('token_owner', {
        contract_address,
      });
    } catch (error) {
      log(error);
    }
  }
  async getAll1155Nfts(contract_address: string): Promise<any> {
    try {
      const nfts = await this.Nft11555Model.find({ contract_address })
      const total_nfts = await this.Nft11555Model.find({ contract_address }).countDocuments();
      return {
        // collection: await this.getContract(contract_address),
        total_nfts,
        // nfts,
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
  async get1155NftOwnersforSingleNft(getNft1155: GetNft1155): Promise<any> {
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
        return `There is no Asset with ${contract_address} and ${token_id}`;

      }
      // check he ownes nft or not 
      // getting all owners
      const get_owners = await this.get1155NftOwnersforSingleNft({ contract_address, token_id });

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
  // 
  async get1155AssetByOwner(getAssetByUser: GetAssetByUser): Promise<any> {
    const { contract_address, token_id, token_owner } = getAssetByUser;
    try {
      const check_nft_exists = await this.get1155Nft({ contract_address, token_id });
      if (!check_nft_exists) {
        return `There is no Asset with ${contract_address} and ${token_id}`;

      }
      //  check he ownes nft or not 
      // getting all owners
      return await this.Nft1155OwnerModel.findOne({ contract_address, token_id, token_owner });
    } catch (error) {
      log(error);
      return {
        success: false,
        message: 'Something Went Wrong',
        error,
      }
    }
  }
  // update user Tokens
  async updateTokens(updateTokens: UpdateTokens): Promise<any> {
    const { contract_address, token_id, _tokens, token_owner, operation } = updateTokens;
    try {
      if (operation === "INCREMENT") return await this.Nft1155OwnerModel.updateOne({ contract_address, token_id, token_owner }, { $inc: { number_of_tokens: _tokens } })
      else return await this.Nft1155OwnerModel.updateOne({ contract_address, token_id, token_owner }, { $inc: { number_of_tokens: -(_tokens) } });
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
      // const nfts = await this.Nft1155OwnerModel.find({ token_owner: owner_address }).sort({ createdAt: -1 }).limit(items_per_page * 1).skip((page_number - 1) * items_per_page);
      // 
      const nfts = await this.Nft1155OwnerModel.aggregate([
        { $match: { token_owner: owner_address } },
        {
          $lookup: {
            from: 'nft1155schemas',
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
                        $eq: ['$$contract_address', '$contract_address'],
                      },
                      {
                        $eq: ['$$token_id', '$token_id'],
                      },
                    ],
                  },
                },
              },
            ],
            as: `auction1`,
          },
        }, {
          $project: {
            contract_address: 1,
            token_id: 1,
            chain: 1,
            token_owner: 1,
            number_of_tokens: 1,
            createdAt: 1,
            updatedAt: 1,
            meta_data: "$auction1.meta_data"
          }
        },
      ])
        .sort({ createdAt: -1 })
        .limit(items_per_page * 1)
        .skip((page_number - 1) * items_per_page);
      // 
      return {
        total_pages: await this.Nft1155OwnerModel.countDocuments({ token_owner: owner_address }),
        current_page: page_number,
        items_per_page,
        nfts
      }
    }
    catch (error) {
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

  async update1155Nft(data: any, update_data: any): Promise<any> {
    try {
      return await this.Nft11555Model.findOneAndUpdate(data, {
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

  async getSingle1155NftByOwner(getNft1155: get1155nft): Promise<any> {
    const { contract_address, token_id, token_owner } = getNft1155;
    try {
      return await this.Nft1155OwnerModel.findOne({ contract_address, token_id, token_owner });
    } catch (error) {
      return {
        success: false,
        message: 'Something went wrong in  Service',
        error,
      }
    }
  }

  async update1155_nft(data, updateData) {
    try {
      return await this.Nft11555Model.findOneAndUpdate(data, updateData);
    } catch (error) {
      console.log(error)

      return {
        message: "something went Wrong",
        error
      }
    }
  }

  //


  async activityfix(): Promise<any> {
    try {
      const totalcount = await this.NftModel.countDocuments({});
      const activities = await this.NftModel.find({});
      for (let i = 0; i < totalcount; i++) {

        let tokenId: any = activities[i].token_id;
        let price: any = activities[i].price;
        console.log(tokenId, i);
        await this.NftModel.updateOne({ _id: activities[i]._id }, { $set: { price: parseInt(price) } })
      }
    } catch (error) {
      log(error);
      return {
        succcess: false,
        message: 'something went wrong',
        error
      }
    }
  }
}

import {
  Body,
  Controller,
  Get,
  Param,
  ParseFilePipe,
  UploadedFile,
  UseInterceptors,
  Post,
  UseGuards,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { NftService } from './nft.service';
import { getcontract, transactions } from './dtos/tokeninfo.dto';
import { ethers } from 'ethers';
import {
  ApiBody,
  ApiConsumes,
  ApiHeader,
  ApiOperation,
  ApiProperty,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
// import { RedisCliService } from '../redis-cli/redis-cli.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
// import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/services/@decorators/roles.decorator';
import { Role } from 'src/services/enum/roles.enum';
import { NFTStorage, File, Blob } from 'nft.storage';
import { MintToken } from './dtos/mintToken.dto';
import { DeploymentService } from 'src/deployment/deployment.service';
import * as fs from 'fs-extra';
import * as path from 'path';
import {
  GetListedCollections,
  GetNftBody,
  Paginate,
  NftContractUser,
} from './dtos/create.nft.dto';
import { GetAssets, GetCollectionBody, GetUserOwnedAssets } from './dtos/collections.dto';
import { GetUserNfts } from 'src/marketplace/dtos/auctiondto/create-auction.dto';
import { ConfigService } from '@nestjs/config';
import { ActivityService } from 'src/activity/activity.service';
import { NftMarketplaceService } from 'src/marketplace/marketplace.service';
import { GetOwner } from './dtos/getowner.dto';
import { APIGuard } from 'src/services/roles.guard';
import { UsersService } from 'src/users/users.service';
import { ignoreElements } from 'rxjs';
import { UploadAsset, UploadAssetError } from './types/uploadasset.types';
import { GetAllNfts } from './types/nft.types';
import { ErrorHandlerType } from 'src/utils/errorhandlers/error.handler';
import { G2Web3_1155 } from './dtos/nft1155.dto';
import { blockParams } from 'handlebars';
import { GetBal1155 } from './dtos/getbal';
import { formatEther, getJsonWalletAddress } from 'ethers/lib/utils';
import { collection, GetNft1155, GetTokensUserHold } from './dtos/getnft1155.dto';
import { CommonService } from 'src/common/common.service';
import { stringify } from 'querystring';
import { type } from 'os';
import { GetCollectionResponse, GetOwnerResponse, GetSingleNft, GetSingleNftWithCollectionAndAuction, GetSingleNftWithCollectionAndSale } from './types/nft721.types';
const { log } = console;
// require('dotenv').config();

//Global
// const RPC_URL = process.env.RPC_URL;

// const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
// const ipfsDecorator = 'ipfs://';
// const token = process.env.NFT_STORAGE_KEY;
// const wallet = new ethers.Wallet(process.env.PRIV_KEY, this.mum_provider);
// const storage = new NFTStorage({ token });

@ApiTags('ERC-721-APIs')
@Controller('nft')
export class NftController721 {
  constructor(
    private configService: ConfigService,
    private nftservice: NftService,
    private readonly nftMarketPlaceService: NftMarketplaceService,
    // private RedisService: RedisCliService,
    private deploymentService: DeploymentService,
    private activityService: ActivityService,
    private usersService: UsersService,
    private readonly commonService: CommonService,
  ) { }
  private NFT_STORAGE_KEY = this.configService.get<string>('NFT_STORAGE_KEY');
  private token = this.NFT_STORAGE_KEY;
  private storage = new NFTStorage({ token: this.token });



  // @Get('total-count/:contract_address')
  // @ApiCreatedResponse({
  //   status: 201,
  //   description: 'Total has been Fetched successfully.',
  //   type: Number,
  // })
  // @ApiResponse({
  //   status: 204,
  //   description: 'There are no NFTS associated with that Game',
  // })
  // @ApiResponse({ status: 403, description: 'Forbidden.' })
  // async totalcount(
  //   @Param('contract_address') contract_address: string,
  // ): Promise<Number> {
  //   return await this.nftservice.getCountNfts(contract_address);
  // }
  // async getUserCollections(): Promise<any> {
  //   try {

  //   } catch (error) {

  //   }
  // }
  // //   Get route
  // @Get(':cntraddr/:id')
  // @ApiResponse({
  //   status: 201,
  //   description: 'To fetch the details the Token URI',
  // })
  // @ApiResponse({ status: 403, description: 'Forbidden.' })
  // async getTokenImage(@Param() NftData: getnft): Promise<string> {
  //   log('The data is: ', NftData.cntraddr, NftData.id);
  //   const nftCntr = new ethers.Contract(NftData.cntraddr, baycAbi, provider); // abi and provider to be declared
  //   // const tokenData = erc20.functions.tokenOfOwnerByIndex(NftData.id);
  //   log('Contract Instance: ', nftCntr);
  //   const tokenURI = await nftCntr.tokenURI(NftData.id);
  //   log('TokenURI: ', tokenURI);
  //   return `your id is ${NftData.cntraddr} and your name is  ${NftData.id}`;
  // }

  // To fetch Contract Details
  // @Get('contract-details')
  // @ApiResponse({ status: 201, description: 'Fetching the contract details' })
  // @ApiResponse({ status: 403, description: 'Forbidden.' })
  // async ContractDetails(): Promise<string> {
  //   return `Contract`;
  // }

  // @Get('get-transactions/:tokenid/:cntraddr')
  // @ApiResponse({ status: 201, description: 'Fetching the Transactions' })
  // @ApiResponse({ status: 403, description: 'Forbidden.' })
  // async Getransactions(@Param() transactions: transactions): Promise<string> {
  //   return `ddf`;
  // }



  // 721


  /****************[GET_ALL_NFTS_WITH_PAGINATION]*****************/
  @ApiResponse({
    status: 200,
    description: 'Successfully Fetched All the Nfts',
    type: GetAllNfts
  })
  @ApiResponse({
    status: 500,
    description: 'Something Went Wrong',
    type: ErrorHandlerType
  })
  @ApiOperation({
    summary: 'Get all the Assets',
  })
  @Get('get-all-nfts/:page_number/:items_per_page/:sort_by/:listed_in')
  async getAllNfts(@Param() pagination: Paginate): Promise<any> {
    const { page_number, items_per_page, sort_by, listed_in } = pagination;
    try {
      const data = await this.nftservice.getAllNfts({
        page_number,
        items_per_page,
        sort_by,
        listed_in
      });
      if (!data) {
        return {
          message: 'There are no nfts present',
        };
      }
      return data;
    } catch (error) {
      log(error);
      return { success: false, message: 'Something went wrong', error };
    }
  }

  /***********[GET_COLLECTIONS_OWNED_BY_USER]**********/
  @ApiResponse({
    status: 200,
    type: GetAllNfts
  })
  @ApiResponse({
    status: 500,
    type: ErrorHandlerType
  })
  @ApiOperation({ summary: 'Get User Collections' })
  @Get('collections-owned/:owner_address/:page_number/:items_per_page')
  async getCollectionsOwned(@Param() params: GetUserOwnedAssets): Promise<any> {
    const { owner_address, page_number, items_per_page } = params;
    try {
      return (await this.nftservice.getCollectionsOwned({ owner_address, page_number, items_per_page }));
    } catch (error) {
      log(error);
      return {
        message: 'something went Wrong',
        error
      }
    }
  }
  /***********[GET_ALL_NFTS_WITH_PAGINATION]****************/
  @ApiOperation({
    summary:
      'Get User Assets by Collection',
  })
  @Get('get-user-nft-cntr/:user_address/:contract_address')
  async getUserNftsByCollection(
    @Param() nftContractDto: NftContractUser,
  ): Promise<any> {
    const { user_address, contract_address } = nftContractDto;
    try {
      const data = await this.nftservice.getNftsOwned(
        ethers.utils.getAddress(user_address),
        contract_address,
      );
      if (!data) {
        return {
          message: 'There are no nfts present',
        };
      }
      return data;
    } catch (error) {
      log(error);
      return { message: 'Something went wrong' };
    }
  }

  //
  @ApiResponse({
    status: 201,
    description: 'Successfully Fetched the details of the Asset',
    type: GetSingleNft,
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully Fetched the details of the Asset',
    type: GetSingleNft,
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully Fetched the details of the Asset',
    type: GetSingleNftWithCollectionAndAuction,
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully Fetched the details of the Asset',
    type: GetSingleNftWithCollectionAndSale,
  })
  @ApiResponse({
    status: 500,
    description: 'Something went Wrong',
    type: ErrorHandlerType
  })
  @ApiOperation({
    summary:
      'Get Asset details',

  })
  @Get('get-nft/:contract_address/:token_id')
  async getNft(@Param() body: GetNftBody): Promise<any> {
    const { contract_address, token_id } = body;
    try {
      const is_nft_exists = await this.nftservice.getNft({
        contract_address,
        token_id,
      });
      log(is_nft_exists);
      const nft = is_nft_exists;
      if (is_nft_exists.nft) {
        const token_owner_info = await this.usersService.getUser(is_nft_exists.nft.token_owner)
        if (is_nft_exists.nft.is_in_auction) {
          const auction = await this.nftservice.getAuction(body);
          log(auction._id);
          const bids = await this.nftservice.getBids(auction._id);
          log(bids);
          return {
            ...nft,
            token_owner_info,
            auction,
            bids,
          };
        }
        if (is_nft_exists.nft.is_in_sale) {
          log(' is in sale');
          const sale = await this.nftMarketPlaceService.getSale({
            contract_address,
            token_id,
            status: 'started',
          });
          const offers = await this.nftMarketPlaceService.getAllOffers({
            sale_id: sale._id,
          });
          return { ...nft, token_owner_info, sale, offers };
        }
        return { ...nft, token_owner_info };
      }

    } catch (error) {
      log(error);
      return { message: 'Something went wrong' };
    }
  }
  //
  @ApiResponse({
    status: 201,
    description: 'Successfully Fetched the Assets that are Owned by User',
    type: [GetSingleNft]
  })
  @ApiResponse({
    status: 500,
    description: 'Something went Wrong',
    type: ErrorHandlerType
  })
  @ApiOperation({ summary: 'Get  Assets by Owner Address' })
  @Get('get-user-nfts/:token_owner/:page_number/:items_per_page')
  async getUserNfts(@Param() body: GetUserNfts): Promise<any> {
    try {
      return await this.nftservice.getUserNfts(body);
    } catch (error) {
      log(error);
      return {
        message: 'Something went wrong',
      };
    }
  }

  //******************[GET_ALL_COLLECTIONS]************************/
  @ApiResponse({
    status: 201,
    description: 'Successfully Fetched the Collections',
    type: collection
  })
  @ApiResponse({
    status: 500,
    description: 'Something went Wrong',
    type: ErrorHandlerType
  })
  @ApiOperation({ summary: 'Get All Collections' })
  @Get('get-collections/:page_number/:items_per_page/:sort_by/:chain/:type')
  async getCollections(@Param() body: GetCollectionBody): Promise<any> {
    try {
      log(body);
      return await this.nftservice.getCollections(body);
    } catch (error) {
      log(error);
      return {
        message: 'something went Wrong',
        error,
      };
    }
  }
  /******************************[GET_NFTS_LISTED]******************/
  @ApiResponse({
    status: 201,
    description: 'Successfully Fetched the Assets that are Listed',
    type: [GetSingleNft]
  })
  @ApiResponse({
    status: 500,
    description: 'Something went Wrong',
    type: ErrorHandlerType
  })
  @ApiOperation({ summary: 'Get Listed Assets' })
  @Get('get-nfts-listed/:listed_in')
  async getNftsListed(@Param('listed_in') listed: string): Promise<any> {
    try {
      const data = await this.nftservice.getNftsListed(listed);
      return data.length > 0 ? data : `Curently no nfts are in ${listed}`;
    } catch (error) {
      log(error);
      return { message: 'something went wrong in controller', error };
    }
  }
  /*******[GET_NFTS_LISTED_IN_SPECIFIC_COLLECTION]**********/
  @ApiResponse({
    status: 201,
    description: 'Successfully Fetched the Assets that are Listed in Collection',
    type: [GetSingleNft]
  })
  @ApiResponse({
    status: 500,
    description: 'Something went Wrong',
    type: ErrorHandlerType
  })
  @ApiOperation({ summary: 'Get Assets that are  Listed in Specific Collection' })
  @Post('get-nfts-721-collection')
  async getNftsListedCollection(
    @Body() Collections_listed: GetListedCollections,
  ): Promise<any> {
    try {
      log(Collections_listed);
      const get_nfts = await this.nftservice.getNftssListed({
        ...Collections_listed,
      });
      return get_nfts;
    } catch (error) {
      log(error);
      return { message: 'something went wrong in controller', error };
    }
  }
  /*******************[GET_NFTS_BY_COLLECTIONS]**********************/
  @ApiResponse({
    status: 201,
    description: 'Successfully Fetched the Collection',
    type: GetCollectionResponse
  })
  @ApiResponse({
    status: 500,
    description: 'Something went Wrong',
    type: ErrorHandlerType
  })
  @ApiOperation({ summary: 'Get Assets by Collection' })
  @Get('collection/:contract_address')
  async GetCollectionsByContractAddress(
    @Param() contract: getcontract,
  ): Promise<any> {
    log(contract.contract_address);
    try {
      log(contract);
      // Fetching Contract details
      const collection = await this.nftservice.getContract(contract.contract_address
      );
      log(collection);
      // fetching all Nfts
      let nfts;
      nfts = await this.nftservice.getNftsByCollection(
        contract.contract_address,
      );
      // fetching data for analysis
      const total_volume = nfts.length;
      const floor_price = 0;
      const best_offer = 0;
      const owners = (
        await this.nftservice.getUniqueOwners(contract.contract_address)
      ).length;
      return {
        collection,
        total_volume,
        floor_price,
        best_offer,
        owners,
        nfts,
      };
    } catch (error) {
      log(error);
      return {
        message: 'Something went wrong ,Our Team is Looking into it ',
        contact: 'For Any Queries You can mail us hello@gmail.com',
        error,
      };
    }
  }
  // *****************************************//
  //                POST APIs                 //
  // *****************************************//

  @ApiResponse({
    status: 201,
    description: 'Successfully Fetched the Owner from the Block Chain',
    type: GetOwnerResponse
  })
  @ApiResponse({
    status: 500,
    description: 'Something went Wrong',
    type: ErrorHandlerType
  })
  @ApiOperation({ summary: 'Get Owner of the Nft from BlockChain' })
  @Get('get-owner/:contract_address/:token_id')
  async getOwner(@Param() get_Owner: GetOwner): Promise<any> {
    const { contract_address, token_id } = get_Owner;
    try {

      const nft1 = await this.nftservice.getContract(contract_address);

      const abiPath = path.join(
        process.cwd(),
        `src/utils/constants/${nft1.type}/${nft1.type}.abi`,
      );
      const abi = fs.readFileSync(abiPath, 'utf-8');

      // 
      const _chain = nft1?.chain?.name;
      const { RPC_URL, API_BASE_URL, provider, wallet, check_environment } = await this.commonService.getWallet(_chain);
      // 
      const contract_instance = new ethers.Contract(contract_address, abi, wallet);
      const get_collecion = await this.nftservice.getCollectionOnly(contract_address);
      log(get_collecion);
      // get_collecion.forEach(async nft => {
      //   log(nft.contract_address, nft.token_id);
      //   const token_idd = parseInt(nft.token_id);

      //   const blkid = await contract_instance.ownerOf(token_idd);
      //   log(nft.token_owner, '==', blkid);
      //   if (nft.token_owner != blkid) {
      //     log('-----------------[PROBLEM]---------------------------');
      //     log('| FOR Token_ID  ', nft.token_id, '                |');
      //     log('|   IN DB                     IN BLOCKCHAIN      ')
      //     log('|', nft.token_owner, '==', blkid, '|');
      //     log('--------------------------------------------');
      //     await this.nftservice.updateNft({ contract_address, token_id: nft.token_id }, { token_owner: blkid });
      //     // const current_nft = await this.nftservice.updateNft(,);
      //   }
      // });
      // log("sss", blkid);
      log(contract_instance);
      const token_idd = token_id;
      const TOKEN_OWNER = await contract_instance.ownerOf(token_idd);
      return {
        contract_address,
        token_id,
        token_owner: TOKEN_OWNER
      };
    } catch (error) {
      log(error);
      return {
        message: "something went Wrong",
        error
      }
    }
  }

  // @ApiOperation({ summary: 'advance fix' })
  // @Get('fix')
  // async fix(): Promise<any> {
  //   try {
  //     return await this.nftservice.activityfix()
  //   } catch (error) {
  //     return {
  //       message: `Something went Wrong`,
  //       error,
  //     }
  //   }
  // }
}

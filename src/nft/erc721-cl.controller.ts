import {
  Body,
  Controller,
  Get,
  Param,
  ParseFilePipe,
  UploadedFile,
  UseInterceptors,
  Post,
  SetMetadata,
  UseGuards,
  Put,
  MaxFileSizeValidator,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NftService } from './nft.service';
import { getcontract, transactions } from './nftitems/tokeninfo.dto';
import { ethers } from 'ethers';
import {
  ApiAcceptedResponse,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiHeader,
  ApiOkResponse,
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
import { Roles } from 'src/guards/roles.decorator';
import { Role } from 'src/guards/roles.enum';
import { NFTStorage, File, Blob } from 'nft.storage';
import { MintToken } from './nftitems/mintToken.dto';
import { DeploymentService } from 'src/deployment/deployment.service';
import * as fs from 'fs-extra';
import * as path from 'path';
import {
  GetListedCollections,
  GetNftBody,
  Paginate,
  NftContractUser,
} from './nftitems/create-nft.dto';
import { GetCollectionBody, GetUserOwnedCollections } from './nftitems/collections.dto';
import { GetUserNfts } from 'src/nft-marketplace/dtos/auctiondto/create-auction.dto';
import { ConfigService } from '@nestjs/config';
import { ActivityService } from 'src/activity/activity.service';
import { NftMarketplaceService } from 'src/nft-marketplace/nft-marketplace.service';
import { GetOwner,getOwnerRes } from './nftitems/get-owner.dto';
import { APIGuard } from 'src/guards/roles.guard';
// import { log } from 'console';
import { UsersService } from 'src/users/users.service';
import { ignoreElements } from 'rxjs';
import { getEnvironment } from 'src/utils/common';
import { getWallet } from '../utils/common';
import { UploadAsset, UploadAssetError } from './schemas/upload-asset.schema';
import { GetAllNfts, getListedNFts, GetAllCollections,GetSingleNft, getAsset,getAllCollections,getAllNfts, GetSingleCollection,getTokenBalance} from './schemas/get-all-nfts.schema';
import { ErrorHandler } from './utils/errorhandlers';
import { G2Web3_1155 } from './nftitems/ngm-1155.dto';
import { blockParams } from 'handlebars';
import { GetBal1155 } from './nftitems/getbal';
import { formatEther } from 'ethers/lib/utils';
const { log } = console;
// require('dotenv').config();

//Global
// const RPC_URL = process.env.RPC_URL;

// const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
// const ipfsDecorator = 'ipfs://';
// const token = process.env.NFT_STORAGE_KEY;
// const wallet = new ethers.Wallet(process.env.PRIV_KEY, this.mum_provider);
// const storage = new NFTStorage({ token });

@ApiTags('ERC721 Collections')
@Controller('nft')
export class Erc721CollectionsController {
  constructor(
    private configService: ConfigService,
    private nftservice: NftService,
    private readonly nftMarketPlaceService: NftMarketplaceService,
    // private RedisService: RedisCliService,
    private deploymentService: DeploymentService,
    private activityService: ActivityService,
    private usersService: UsersService
  ) { }
  private MATIC_MUMBAI_RPC_URL = this.configService.get<string>(
    'MUMBAI_RPC_URL',
  );
  private RPC_URL = this.configService.get<string>('RPC_URL');
  private NFT_STORAGE_KEY = this.configService.get<string>('NFT_STORAGE_KEY');
  private PRIV_KEY = this.configService.get<string>('PRIV_KEY');
  //Global
  private mum_provider = new ethers.providers.JsonRpcProvider(
    this.MATIC_MUMBAI_RPC_URL,
  );
  private provider = new ethers.providers.JsonRpcProvider(this.RPC_URL);
  private ipfsDecorator = 'ipfs://';
  private token = this.NFT_STORAGE_KEY;
  private wallet = new ethers.Wallet(this.PRIV_KEY, this.mum_provider);
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



  /***********[GET_COLLECTIONS_OWNED_BY_USER]**********/
  @ApiOperation({ summary: 'Get User Collections' })
  @ApiResponse({
    status: 201,
    type: GetAllCollections
  })
  @ApiResponse({
    status: 500,
    type: ErrorHandler
  })
  @Get('collections-owned/:owner_address/:page_number/:items_per_page')
  async getCollectionsOwned(@Param() params: GetUserOwnedCollections): Promise<any> {
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
 
  //******************[GET_ALL_COLLECTIONS]************************/
  @ApiOperation({ summary: 'Get All Collections' })
  @ApiResponse({
    status: 201,
    type: getAllCollections
  })
  @ApiResponse({
    status: 500,
    type: ErrorHandler
  })
  @Get('get-collections/:page_number/:items_per_page')
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
  /*******************[GET_NFTS_BY_COLLECTIONS]**********************/
  @ApiOperation({ summary: 'Get Assets by Collection' })
  @ApiResponse({
    status: 201,
    type: GetSingleCollection
  })
  @ApiResponse({
    status: 500,
    type: ErrorHandler
  })
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
      const nfts = await this.nftservice.getNftsByCollection(
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

}

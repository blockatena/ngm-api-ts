import {
  Body,
  Controller,
  Get,
  Param,
  ParseFilePipe,
  UploadedFile,
  UseInterceptors,
  Post,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { NftService } from './nft.service';
import { ethers } from 'ethers';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
// import { RedisCliService } from '../redis-cli/redis-cli.service';
import { FileInterceptor } from '@nestjs/platform-express';
// import { RolesGuard } from 'src/guards/roles.guard'
import { NFTStorage, File, Blob } from 'nft.storage';
import * as fs from 'fs-extra';
import * as path from 'path';
import { GetListedCollections } from './dtos/create.nft.dto';
import { GetUserOwnedAssets, GetUserOwnedAssetsByCollections } from './dtos/collections.dto';
import { ConfigService } from '@nestjs/config';
import { ActivityService } from 'src/activity/activity.service';
// import { log } from 'console';
import { UploadAsset, UploadAssetError } from './types/uploadasset.types';
import { ErrorHandlerType } from 'src/utils/errorhandlers/error.handler';
import { GetBal1155 } from './dtos/getbal';
import {
  get1155AssetsByCollectionResponse,
  GetNft1155,
  GetSingle1155Nft,
  GetTokensUserHold,
  GetTokensUserHoldResponse,
  GetUserHoldTokensResponse,
  GetUserOwned1155Assets,
} from './dtos/getnft1155.dto';
import { CommonService } from 'src/common/common.service';
import { DeploymentService } from '../deployment/deployment.service';
import { NftMarketplaceService } from '../marketplace/marketplace.service';
import { UsersService } from '../users/users.service';
const { log } = console;
@ApiTags('ERC-1155-APIs')
@Controller('nft')
export class NftController1155 {
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

  // File Upload
  @ApiResponse({
    status: 200,
    description: `Successfully Get the <b>URI</b> of your Asset`,
    type: UploadAsset,
  })
  @ApiResponse({
    status: 400,
    type: UploadAssetError,
    description: ``,
  })
  @ApiResponse({
    status: 500,
    type: UploadAssetError,
    description: `Something went wrong in out server.`,
  })
  @ApiOperation({
    summary: 'Upload  asset and gets you URI of that asset',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  @Post('uploadFile')
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 50000000 }),
          // new FileTypeValidator({ fileType: 'text' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<UploadAsset | UploadAssetError> {
    try {
      log(file);
      const blob = new Blob([file.buffer]);
      const toUploadFile = new File([blob], `/${file.originalname}`, {
        type: file.mimetype,
      });
      const cid = await this.storage.storeDirectory([toUploadFile]);
      const tokenUri = `https://nftstorage.link/ipfs/${cid}/${file.originalname}`;
      log({ tokenUri });
      return { uri: tokenUri };
    } catch (error) {
      return {
        success: false,
        message: `Something went Wrong Please Raise a Ticket or contact Support :<b>vinay@blocktena.com</b>`,
        error,
      };
    }
  }
  // get number of tokens does user holder
  @ApiResponse({
    status: 201,
    description: `Successfully Get Number of Tokens does the Owner Hold`,
    type: GetTokensUserHoldResponse,
  })
  @ApiResponse({
    status: 500,
    description: `Something went wrong in Server`,
    type: ErrorHandlerType,
  })
  @ApiOperation({ summary: 'Gets Number of Tokens does Owner hold' })
  @Get('g2w3-1155/get-tokens/:token_owner/:contract_address/:token_id')
  async getTokensUsrHold(
    @Param() getTokensUserHold: GetTokensUserHold,
  ): Promise<any> {
    const { contract_address, token_id, token_owner } = getTokensUserHold;
    try {
      //get nft
      log(getTokensUserHold);
      return {
        contract_address,
        token_id,
        token_owner,
        number_of_tokens: await this.nftservice.getTokensUserHold(
          getTokensUserHold,
        ),
      };
    } catch (error) {
      log(error);
      return {
        message: 'Something Went Wrong',
        error,
      };
    }
  }
  /*********[GET_1155_NFTS_BY_COLLECTION]***********/
  @ApiResponse({
    status: 201,
    description: `Successfully Get the Assets By Collection`,
    type: get1155AssetsByCollectionResponse,
  })
  @ApiResponse({
    status: 500,
    description: `Something went wrong in Server`,
    type: ErrorHandlerType,
  })
  @ApiOperation({ summary: 'Get Assets by collection' })
  @Post('get-nfts-1155-collection')
  async getNfts1155Collection(
    @Body() Collections_listed: GetListedCollections,
  ): Promise<any> {
    const { address_type, address } = Collections_listed;
    try {
      log(Collections_listed);
      let unique_owners;
      if (address_type == 'COLLECTION') {
        unique_owners = await this.nftservice.uniqueOwners1155(address);
      }
      log({ unique_owners });

      const get_nfts = await this.nftservice.get1155Nfts({
        ...Collections_listed,
      });
      return {
        unique_owners: unique_owners.length || 0,
        get_nfts,
      };
    } catch (error) {
      log(error);
      return { message: 'something went wrong in controller', error };
    }
  }
  // get type of nft 1155 or 721
  @ApiOperation({ summary: 'Get the type of Collection' })
  @Get('get-type-of-nft/:contract_address')
  async getNftType(
    @Param('contract_address') contract_address: string,
  ): Promise<any> {
    try {
      log(contract_address);

      const collection = await this.nftservice.getContract(contract_address);
      log(collection);
      return { type: collection.type };
    } catch (error) {
      log(error);
      return {
        success: false,
        message: `Something Went Wrong`,
        error,
      };
    }
  }

  //  Minting Helpers
  // Guard

  // @Post('mint-batch-nft/:ERC_TOKEN')
  // async mintBatchNFT(@Param('ERC_TOKEN') ERC_TOKEN: string) {}
  // @Post('blacklist-nft/:tokenid/:cntraddr')
  // async blacklistNFT(@Param() blacklist: transactions) {}
  @ApiResponse({
    status: 201,
    description: `Successfully Get the Number of Tokens does Owner Hold from Block Chain`,
    type: GetUserHoldTokensResponse,
  })
  @ApiResponse({
    status: 500,
    description: `Something went wrong`,
    type: ErrorHandlerType,
  })
  @ApiOperation({ summary: 'Fetch Balance of Tokens from Block Chain' })
  @Get('get-balance-of-token/:contract_address/:token_id/:owner_address')
  async getBalanceOf1155Token(@Param() getBal: GetBal1155): Promise<any> {
    const { contract_address, token_id, owner_address } = getBal;
    try {
      //
      const contract_details =
        await this.deploymentService.getContractDetailsByContractAddress(
          contract_address,
        );
      // check contract is present ot not
      if (!contract_details) {
        return `Collection address is Incorrect or Collection Doesnt exist`;
      }
      const type = contract_details.type;
      log('CONTRACT_DETAILS \n', contract_details);

      // Multi Chain Integration
      const _chain = contract_details?.chain?.name;
      const { RPC_URL, API_BASE_URL, provider, wallet, check_environment } =
        await this.commonService.getWallet(_chain);
      if (!check_environment) {
        return `Invalid Environment`;
      }

      log(contract_details);
      const abiPath = path.join(
        process.cwd(),
        `src/utils/constants/${type}/${type}.abi`,
      );
      log(process.cwd());
      const abi = fs.readFileSync(abiPath, 'utf-8');

      const nftCntr = new ethers.Contract(contract_address, abi, wallet); // abi and provider to be declared
      console.log(nftCntr);
      const bal = await nftCntr.balanceOf(
        ethers.utils.getAddress(owner_address),
        token_id,
      );
      const fmt = parseInt(bal._hex);
      log('balu', fmt);
      return {
        contract_address,
        token_id,
        owner_address,
        balance: fmt,
      };
    } catch (error) {
      return {
        message: 'Something Went Wrong',
        error,
      };
    }
  }
  // get number of tokens does he have
  @ApiResponse({
    status: 201,
    description: `Successfully Get the Token Details and its Status`,
    type: GetSingle1155Nft,
  })
  @ApiResponse({
    status: 500,
    description: `Something went wrong`,
    type: ErrorHandlerType,
  })
  @ApiOperation({
    summary: 'Get the 1155 token details along with its stakeHolders',
  })
  @Get('get-1155-nft/:contract_address/:token_id')
  async g2Web3_1155(@Param() getNft1155: GetNft1155): Promise<any> {
    const { contract_address, token_id } = getNft1155;
    try {
      //Check Nft is Present or Not
      //return the Nft along with owners and their stake
      return {
        contract_details: await this.nftservice.getContract(contract_address),
        nft: await this.nftservice.get1155Nft({ contract_address, token_id }),
        owners: await this.nftservice.get1155NftOwnersforSingleNft({
          contract_address,
          token_id,
        }),
        offers: await this.nftMarketPlaceService.getAll1155offer({
          contract_address,
          token_id,
          status: 'started',
        }),
        sales: await this.nftMarketPlaceService.getAll1155sale({
          contract_address,
          token_id,
          status: 'started',
        }),
      };
    } catch (error) {
      return {
        message: `Something went Wrong`,
        error,
      };
    }
  }
  // Get 1155 nft by owner
  @ApiResponse({
    status: 201,
    description: `Successfully Get the Token Details and its Status`,
    type: [GetUserOwned1155Assets],
  })
  @ApiResponse({
    status: 500,
    description: `Something went wrong`,
    type: ErrorHandlerType,
  })
  @ApiOperation({ summary: 'Get 1155 Assets Owned by User' })
  @Get('g2w3-1155/:owner_address/:page_number/:items_per_page')
  async g2Web3User1155(
    @Param() getUserOwnedAssets: GetUserOwnedAssets,
  ): Promise<any> {
    const { owner_address, page_number, items_per_page } = getUserOwnedAssets;
    try {
      return await this.nftservice.get1155NftByOwner(getUserOwnedAssets);
    } catch (error) {
      error;
      return {
        success: false,
        message: 'something Went Wrong',
        error,
      };
    }
  }
  // get 1155 User1155 Assets for Particular Collection
  @Get('get-user-1155-assets-by-collection/:owner_address/:contract_address')
  async getUser1155AssetsByCollection(@Param() body: GetUserOwnedAssetsByCollections): Promise<any> {
    try {
      console.log(body);
      return await this.nftservice.getUser1155AssetsByCollection(body);
    } catch (error) {
      log(error)
      return {
        success: false,
        message: "Unable to Fetch Nfts",
        error
      }
    }
  }


}

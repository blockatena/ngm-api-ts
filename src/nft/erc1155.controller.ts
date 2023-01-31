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

@ApiTags('ERC1155 NFTs')
@Controller('nft')
export class ERC1155NftController {
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

  @ApiOperation({ summary: 'Get ERC1155 token quantity' })
  @ApiResponse({
    status: 201,
    type: getTokenBalance
  })
  @ApiResponse({
    status: 500,
    type: ErrorHandler
  })
  @Get('Get-Balance-of-Token/:contract_address/:token_id')
  async getBalanceOf1155Token(@Param() getBal: GetBal1155): Promise<any> {
    const { contract_address, token_id } = getBal;
    try {
      // 
      const ENVIRONMENT = getEnvironment();
      const check_environment = ENVIRONMENT === 'DEV' || ENVIRONMENT === 'PROD';
      if (!check_environment) {
        return `Invalid Environment check env  current Environment is ${ENVIRONMENT}`;
      }
      // log(`Current Environment is ${ENVIRONMENT}`);
      const chain_typee = this.configService.get<any>(
        ENVIRONMENT,
      );

      const contract_details =
        await this.deploymentService.getContractDetailsByContractAddress(
          contract_address,
        );
      const type = contract_details.type;
      if (!(type === "NGM1155")) {
        return `You can only mint 1155 Here`;
      }

      log(contract_details);
      const current_chain = contract_details?.chain?.name;
      log(`current_chain ${current_chain}`,)
      const chains = Object.keys(chain_typee);
      log(`  chains ${chains}`,)
      const chain_available = chains.find(chain => chain === current_chain);
      log(`chain_available    ${chain_available}  `);
      if (!chain_available) {
        return {
          message: `you are on ${ENVIRONMENT}  your collection ${contract_details.collection_name} is not deployed here `,
          chains
        }
      }
      // log(`Requested Chain ${chain_typee}`);
      const chain_type = chain_typee[`${current_chain}`];
      log(`RPC is ${chain_type}`);
      // Multi Chain Integration
      const RPC_URL = chain_type;
      const PRIV_KEY = this.configService.get<string>('PRIV_KEY');
      log(`RPC_URL   ${RPC_URL} \n
      PRIV_KEY   ${PRIV_KEY} \n
      `)
      // 
      log("completed");
      const { provider,
        wallet } = getWallet({
          RPC_URL,
          PRIV_KEY
        })
      // log(provider, wallet);

      // Get Provider
      // const provider = new ethers.providers.JsonRpcProvider(
      //   RPC_URL,
      // );
      // // add limit
      // log(RPC_URL, provider);
      // const wallet = new ethers.Wallet(PRIV_KEY, provider);
      // only the contract owner should be the minter 

      log(wallet);
      const collection_count = await this.nftservice.countCollections({ owner_address: contract_details.owner_address })
      // const is_limit_exceeded = body.limit <= collection_count;
      // log("nope");
      log(contract_details);
      const abiPath = path.join(
        process.cwd(),
        `src/utils/constants/${type}/${type}.abi`,
      );
      log(process.cwd());
      const abi = fs.readFileSync(abiPath, 'utf-8');
      // mint token using ethersjs
      const nftCntr = new ethers.Contract(
        contract_address,
        abi,
        wallet,
      ); // abi and provider to be declared
      console.log(nftCntr);
      const bal = await nftCntr.balanceOf(ethers.utils.getAddress("0xa8E7CCE298F1C2e52DE6920840d80C28Fc787F72"), 0);
      const fmt = parseInt(bal._hex);

      log("balu", fmt)

      return fmt;
    } catch (error) {

    }
  }
}

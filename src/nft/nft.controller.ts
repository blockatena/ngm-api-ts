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
import { GetOwner } from './nftitems/get-owner.dto';
import { APIGuard } from 'src/guards/roles.guard';
// import { log } from 'console';
import { UsersService } from 'src/users/users.service';
import { ignoreElements } from 'rxjs';
import { getEnvironment } from 'src/utils/common';
import { getWallet } from '../utils/common';
import { UploadAsset, UploadAssetError } from './schemas/upload-asset.schema';
import { GetAllNfts } from './schemas/get-all-nfts.schema';
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

@ApiTags('GamesToWeb3 APIs')
@Controller('nft')
export class NftController {
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
      const contract_instance = new ethers.Contract(contract_address, abi, this.wallet);
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
      const token_idd = parseInt(token_id);
      const blkid = await contract_instance.ownerOf(token_idd);
      return blkid;
    } catch (error) {
      log(error);
      return {
        message: "something went Wrong",
        error
      }
    }
  }
  // File Upload
  @ApiResponse({
    status: 200,
    description: `Successfully Get the <b>URI</b> of your Asset`,
    type: UploadAsset
  })

  @ApiResponse({
    status: 400,
    type: UploadAssetError,
    description: ``
  })
  @ApiResponse({
    status: 500,
    type: UploadAssetError,
    description: `Something went wrong in out server.`
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
  @UseInterceptors(
    FileInterceptor('file'),
  )
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
        error
      };
    }
  }

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


  /****************[GET ALL NFTS WITH PAGINATION]*****************/
  @ApiResponse({
    status: 201,
    type: GetAllNfts
  })
  @ApiResponse({
    status: 500,
    type: ErrorHandler
  })
  @ApiOperation({
    summary: 'Get all Assets',
  })
  @Get('get-all-nfts/:page_number/:items_per_page')
  async getAllNfts(@Param() pagination: Paginate): Promise<any> {
    const { page_number, items_per_page } = pagination;
    try {
      const data = await this.nftservice.getAllNfts({
        page_number,
        items_per_page,
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
  @ApiOperation({ summary: 'Get User Collections' })
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
  /***********[GET_ALL_NFTS_WITH_PAGINATION]****************/
  @ApiOperation({
    summary:
      'Get Assets by Collection',
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
  @ApiOperation({
    summary:
      'Get Asset',
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
      if (!is_nft_exists.nft) {
        return 'Nft is not present with that details';
      }
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
    } catch (error) {
      log(error);
      return { message: 'Something went wrong' };
    }
  }
  //
  @ApiOperation({ summary: 'Get User Assets' })
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
  @ApiOperation({ summary: 'Get User Collections' })
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
  /******************************[GET_NFTS_LISTED]******************/
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
  @ApiOperation({ summary: ' will gets you Nfts that are in Auction' })
  @Post('get-nfts-listed-collection')
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
  // *****************************************//
  //                POST APIs                 //
  // *****************************************//
  @ApiOperation({
    summary: 'Mint ERC 721 Asset',
  })
  @ApiHeader({
    name: 'X-API-HEADER',
    description: 'API key needed for mint'
  })
  @UseGuards(APIGuard)
  @Post('mint-nft')
  async mintNft(@Body() body: MintToken) {
    const { contract_address, token_owner, number_of_tokens, name,
      image_uri,
      description,
      external_uri,
      attributes } = body;
    try {
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
      // if (type === "NGM1155") {
      //   return `You can\'t mint 1155 here`;
      // }
      if (!(token_owner === contract_details.owner_address)) {
        return `Only the Contract Owner should Mint the NFT`
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
      log('nftContract: ', nftCntr);
      const feeData = await provider.getFeeData();

      // here
      const mintToken = await nftCntr.mint(
        ethers.utils.getAddress(token_owner),
        1,
        { gasPrice: feeData.gasPrice }
      );
      // here

      log('minttoken', mintToken);
      const res = await mintToken.wait(1);

      log('response', res);

      const tokenId = parseInt(res.events[0].args.tokenId._hex || '0');
      // const tokenURI = await nftCntr.tokenURI(parseInt(tokenId));
      const jsonData = {
        name,
        image: image_uri,
        description,
        external_uri,
        attributes,
      };
      const jsonBlob = new Blob([JSON.stringify(jsonData)]);
      const cid = await this.storage.storeBlob(jsonBlob);
      const nftStorageUri = `https://nftstorage.link/ipfs`;
      const baseApiUri = process.env.API_BASE_URL || 'http://localhost:8080';
      log(baseApiUri, 'baseApiUri');
      const meta_data_url = `${baseApiUri}/metadata/${contract_address}/${tokenId}`;
      const ipfsMetadataUri = `${nftStorageUri}/${cid}`;

      log('ipfsMetadataUri', ipfsMetadataUri);
      const chain = { id: res.chainId || 5, name: current_chain };
      const collection = await this.nftservice.getNftsByCollection(
        body.contract_address,
      );
      // log(collection);
      // log('here', collection.length);
      if (collection.length < 3) {
        this.nftservice.pushImagesToCollection(
          contract_address,
          image_uri,
        );
      }
      //
      log('metadata');
      const arrdb = {
        contract_address,
        contract_type: type,
        token_id: tokenId,
        chain: { id: mintToken.chainId, name: current_chain },
        meta_data_url,
        is_in_auction: false,
        token_owner: ethers.utils.getAddress(body.token_owner),
        meta_data: jsonData,
      };
      log(arrdb);
      //add to Activity

      await this.activityService.createActivity({
        event: 'Minted',
        item: {
          name: jsonData.name,
          contract_address: arrdb.contract_address,
          token_id: `${arrdb.token_id}`,
          image: jsonData.image,
        },
        price: 0,
        quantity: 1,
        transaction_hash: mintToken.hash,
        from: '0x0000000000000000000000000000000000000000',
        to: ethers.utils.getAddress(body.token_owner),
        read: false,
      });
      const data = await this.nftservice.createNft(arrdb);
      log(data);
      const metadata = await this.nftservice.pushTokenUriToDocArray(
        contract_address,
        ipfsMetadataUri,
        tokenId,
        type,
        chain
      );
      return data;
    }
    catch (error) {
      log(error);
      return {
        message: "Something went Wrong",
        error
      }
    }
  }
  //  Minting Helpers
  @ApiOperation({ summary: "Mint GTW3 1155 Tokens" })
  @Post('mint-1155')
  async g2Web31155(@Body() body: G2Web3_1155): Promise<any> {
    const {
      token_owner,
      token_id,
      number_of_tokens,
      contract_address,
      name,
      image_uri,
      attributes,
      description,
      external_uri
    } = body
    try {
      // 
      log(body);
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
      if (!(token_owner === contract_details.owner_address)) {
        return `Only the Contract Owner should Mint the NFT`
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

      // log(wallet);
      // const collection_count = await this.nftservice.countCollections({ owner_address: contract_details.owner_address })
      // const is_limit_exceeded = body.limit <= collection_count;
      // log("nope");
      log(contract_details);
      const abiPath = path.join(
        process.cwd(),
        `src/utils/constants/NGM1155/NGM1155.abi`,
      );
      // log(process.cwd());
      const abi = fs.readFileSync(abiPath, 'utf-8');
      // mint token using ethersjs
      const nftCntr = new ethers.Contract(
        contract_address,
        abi,
        wallet,
      ); // abi and provider to be declared
      log('nftContract:::::: ', nftCntr);
      const feeData = await provider.getFeeData();

      //  Minting Part
      const mintToken = await nftCntr.mint(
        ethers.utils.getAddress(token_owner),
        token_id,
        number_of_tokens,
        "0x00",
      );
      // here

      log('minttoken::::', mintToken);
      const res = await mintToken.wait(1);

      log('response', res);

      // const tokenId = parseInt(res?.events[0]?.args?.tokenId?._hex || '0');
      // const tokenURI = await nftCntr.tokenURI(parseInt(tokenId));
      const jsonData = {
        name,
        image: image_uri,
        description,
        external_uri,
        attributes,
      };
      const jsonBlob = new Blob([JSON.stringify(jsonData)]);
      const cid = await this.storage.storeBlob(jsonBlob);
      const nftStorageUri = `https://nftstorage.link/ipfs`;
      const baseApiUri = process.env.API_BASE_URL || 'http://localhost:8080';
      log(baseApiUri, 'baseApiUri');
      const meta_data_url = `${baseApiUri}/metadata/${contract_address}/${token_id}`;
      const ipfsMetadataUri = `${nftStorageUri}/${cid}`;

      log('ipfsMetadataUri', ipfsMetadataUri);
      console.log("chain id ", mintToken.chainId);
      const chain = { id: mintToken.chainId || 5, name: current_chain };
      const collection = await this.nftservice.getNftsByCollection(
        body.contract_address,
      );
      // log(collection);
      // log('here', collection.length);
      if (collection.length < 3) {
        this.nftservice.pushImagesToCollection(
          contract_address,
          image_uri,
        );
      }
      //
      log('metadata');
      const arrdb = {
        contract_address,
        contract_type: type,
        token_id,
        number_of_tokens,
        chain: { id: mintToken.chainId, name: current_chain },
        meta_data_url,
        is_in_auction: false,
        token_owner: ethers.utils.getAddress(body.token_owner),
        meta_data: jsonData,
      };
      log(arrdb);
      //add to Activity

      await this.activityService.createActivity({
        event: 'Minted',
        item: {
          name: jsonData.name,
          contract_address: arrdb.contract_address,
          token_id: `${arrdb.token_id}`,
          image: jsonData.image,
        },
        price: 0,
        quantity: number_of_tokens,
        transaction_hash: mintToken.hash,
        from: '0x0000000000000000000000000000000000000000',
        to: ethers.utils.getAddress(body.token_owner),
        read: false,
      });
      const data = await this.nftservice.create1155Nft(arrdb);
      log(data);
      const metadata = await this.nftservice.pushTokenUriToDocArray(
        contract_address,
        ipfsMetadataUri,
        token_id,
        type,
        chain
      );
      return data;

    } catch (error) {
      log(error);
      return {
        success: false,
        message: 'something went wrong',
        error
      }
    }
  }

  // @Post('mint-batch-nft/:ERC_TOKEN')
  // async mintBatchNFT(@Param('ERC_TOKEN') ERC_TOKEN: string) {}
  // @Post('blacklist-nft/:tokenid/:cntraddr')
  // async blacklistNFT(@Param() blacklist: transactions) {}


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

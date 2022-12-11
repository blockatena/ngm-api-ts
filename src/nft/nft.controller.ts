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
} from '@nestjs/common';
import { NftService } from './nft.service';
import { getcontract, transactions } from './nftitems/tokeninfo.dto';
import { ethers } from 'ethers';
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
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
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/guards/roles.decorator';
import { Role } from 'src/guards/roles.enum';
import { NFTStorage, File, Blob } from 'nft.storage';
import { mintToken } from './nftitems/mintToken.dto';
import { DeploymentService } from 'src/deployment/deployment.service';
import * as fs from 'fs-extra';
import * as path from 'path';
import {
  GetListedCollections,
  GetNftBody,
  Paginate,
  NftContractUser,
} from './nftitems/create-nft.dto';
import { GetCollectionBody } from './nftitems/collections.dto';
import { GetUserNfts } from 'src/nft-marketplace/dtos/auctiondto/create-auction.dto';
import { ConfigService } from '@nestjs/config';
import { ActivityService } from 'src/activity/activity.service';
import { NftMarketplaceService } from 'src/nft-marketplace/nft-marketplace.service';
import { GetOwner } from './nftitems/get-owner.dto';

// require('dotenv').config();

//Global
// const RPC_URL = process.env.RPC_URL;

// const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
// const ipfsDecorator = 'ipfs://';
// const token = process.env.NFT_STORAGE_KEY;
// const wallet = new ethers.Wallet(process.env.PRIV_KEY, this.mum_provider);
// const storage = new NFTStorage({ token });

@ApiTags('NGM APIs')
@Controller('nft')
// @UseGuards(RolesGuard)
export class NftController {
  constructor(
    private configService: ConfigService,
    private nftservice: NftService,
    private readonly nftMarketPlaceService: NftMarketplaceService,
    // private RedisService: RedisCliService,
    private deploymentService: DeploymentService,
    private activityService: ActivityService,
  ) { }
  private MATIC_MUMBAI_RPC_URL = this.configService.get<string>(
    'MATIC_MUMBAI_RPC_URL',
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

  @ApiOperation({ summary: 'This Api will Gets you the actual owner of the Nft from BlockChain' })
  @Get('get-owner/:contract_address/:token_id')
  async getOwner(@Param() get_Owner: GetOwner): Promise<any> {
    const { contract_address, token_id } = get_Owner;
    try {
      // Getting Single Nft
      // const nft1 = await this.nftservice.getSingleNft({ contract_address, token_id })
      const nft1 = await this.nftservice.getContract(contract_address);
      // Getting Abi of requried Contract Type
      // console.log(get_contract_only);
      const abiPath = path.join(
        process.cwd(),
        `src/utils/constants/${nft1.type}/${nft1.type}.abi`,
      );
      const abi = fs.readFileSync(abiPath, 'utf-8');
      const contract_instance = new ethers.Contract(contract_address, abi, this.wallet);
      const get_collecion = await this.nftservice.getCollectionOnly(contract_address);
      console.log(get_collecion);
      get_collecion.forEach(async nft => {
        console.log(nft.contract_address, nft.token_id);
        const token_idd = parseInt(nft.token_id);

        const blkid = await contract_instance.ownerOf(token_idd);
        console.log(nft.token_owner, '==', blkid);
        if (nft.token_owner != blkid) {
          console.log('-----------------[PROBLEM]---------------------------');
          console.log('| FOR Token_ID  ', nft.token_id, '                |');
          console.log('|   IN DB                     IN BLOCKCHAIN      ')
          console.log('|', nft.token_owner, '==', blkid, '|');
          console.log('--------------------------------------------');
          await this.nftservice.updateNft({ contract_address, token_id: nft.token_id }, { token_owner: blkid });
          // const current_nft = await this.nftservice.updateNft(,);
        }
      });
      // console.log("sss", blkid);
      return 'done ';
    } catch (error) {
      console.log(error);
      return {
        message: "something went Wrong"
      }
    }
  }
  // File Upload

  @ApiOperation({
    summary: 'This Api will upload your asset and gets you URI of that asset',
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
    // {
    // storage: diskStorage({
    //   destination: './files',
    //   filename: (req, file, callback) => {
    // const uniqueSuffix = Date.now() + '-' + Math.random() * 1e9;
    // const ext = extname(file.originalname);
    // const filename = `${file.originalname}-${uniqueSuffix}${ext}`;
    // callback(null, filename);
    // },
    // }),
    // }
  )
  @Post('uploadFile')
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          // new MaxFileSizeValidator({ maxSize: 10000 }),
          // new FileTypeValidator({ fileType: 'text' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    try {
      console.log(file);
      const blob = new Blob([file.buffer]);
      const toUploadFile = new File([blob], `/${file.originalname}`, {
        type: file.mimetype,
      });
      const cid = await this.storage.storeDirectory([toUploadFile]);
      const tokenUri = `https://nftstorage.link/ipfs/${cid}/${file.originalname}`;
      console.log({ tokenUri });
      // **********Storing in Db

      // **********
      return tokenUri;
    } catch (error) {
      return {
        success: false,
        message: 'something went Wrong'
      };
    }
  }

  //
  // To Get all All NFTs in the Db
  // For Docs
  // You can Specify access to single person or multiple persons
  // You can give permissions to as many people as you want
  // @SetMetadata('roles', [Role.Admin, Role.User])
  // @Get('get-all-nfts/:jwt')
  // // @ApiOperation({ summary: 'To Get All Nfts' })
  // @ApiCreatedResponse({
  //   status: 201,
  //   description: 'The records has been fetched successfully.',
  //   type: [getnft],
  // })
  //
  // Logic
  // @ApiResponse({ status: 403, description: 'Forbidden.' })
  // async getallNfts(@Param('jwt') jwt: string): Promise<any> {
  //   // const data = await this.RedisService.getEx('allNfts');
  //   // if (data) {
  //   //   return data;
  //   // }
  //   const fetchData = [{ cntraddr: 'cntraddr', id: 'id' }];
  //   // await this.RedisService.set('allNfts', JSON.stringify(fetchData));
  //   return fetchData;
  // }

  // to fetch total number of NFTs related to the game
  @Get('total-count/:contract_address')
  @ApiCreatedResponse({
    status: 201,
    description: 'Total has been Fetched successfully.',
    type: Number,
  })
  @ApiResponse({
    status: 204,
    description: 'There are no NFTS associated with that Game',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async totalcount(
    @Param('contract_address') contract_address: string,
  ): Promise<Number> {
    return await this.nftservice.getCountNfts(contract_address);
  }

  // //   Get route
  // @Get(':cntraddr/:id')
  // @ApiResponse({
  //   status: 201,
  //   description: 'To fetch the details the Token URI',
  // })
  // @ApiResponse({ status: 403, description: 'Forbidden.' })
  // async getTokenImage(@Param() NftData: getnft): Promise<string> {
  //   console.log('The data is: ', NftData.cntraddr, NftData.id);
  //   const nftCntr = new ethers.Contract(NftData.cntraddr, baycAbi, provider); // abi and provider to be declared
  //   // const tokenData = erc20.functions.tokenOfOwnerByIndex(NftData.id);
  //   console.log('Contract Instance: ', nftCntr);
  //   const tokenURI = await nftCntr.tokenURI(NftData.id);
  //   console.log('TokenURI: ', tokenURI);
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

  @ApiOperation({
    summary: 'This Api will gets you all the Assets',
  })
  /****************[GET ALL NFTS WITH PAGINATION]*****************/
  @Get('Get-all-nfts/:page_number/:items_per_page')
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
      console.log(error);
      return { message: 'Something went wrong' };
    }
  }

  @ApiOperation({
    summary:
      'This Api will gets you all the nfts by contract address owned by the user',
  })
  /** [GET ALL NFTS WITH PAGINATION]*/
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
      console.log(error);
      return { message: 'Something went wrong' };
    }
  }

  //
  @ApiOperation({
    summary:
      'This Api will gets you Specific asset given by contract_address and Token_id in Params',
  })
  // ***************/
  // get owner assets pending
  //************ */
  @Get('get-nft/:contract_address/:token_id')
  async getNft(@Param() body: GetNftBody): Promise<any> {
    // Validations
    // check in Db
    //  return await this.nftservice.
    //  const get_nft=await this.nftservice.
    const { contract_address, token_id } = body;
    try {
      const is_nft_exists = await this.nftservice.getNft({
        contract_address,
        token_id,
      });
      console.log(is_nft_exists);
      const nft = is_nft_exists;
      if (!is_nft_exists.nft) {
        return 'Nft is not present with that details';
      }
      const nft_activity = await this.activityService.getItemActivity({
        contract_address,
        token_id,
      });
      if (is_nft_exists.nft.is_in_auction) {
        const auction = await this.nftservice.getAuction(body);
        console.log(auction._id);
        const bids = await this.nftservice.getBids(auction._id);
        console.log(bids);
        return {
          ...nft,
          nft_activity,
          auction,
          bids,
        };
      }
      console.log(is_nft_exists.is_in_sale, 'true');
      if (is_nft_exists.nft.is_in_sale) {
        console.log(' is in sale');
        const sale = await this.nftMarketPlaceService.getSale({
          contract_address,
          token_id,
          status: 'started',
        });
        const offers = await this.nftMarketPlaceService.getAllOffers({
          sale_id: sale._id,
        });
        return { ...nft, nft_activity, sale, offers };
      }
      return { ...nft, nft_activity };
    } catch (error) {
      console.log(error);
      return { message: 'Something went wrong' };
    }
  }
  //
  @ApiOperation({ summary: 'This API will get user nfts' })
  @Get('get-user-nfts/:token_owner/:page_number/:items_per_page')
  async getUserNfts(@Param() body: GetUserNfts): Promise<any> {
    try {
      return await this.nftservice.getUserNfts(body);
    } catch (error) {
      console.log(error);
      return {
        message: 'Something went wrong',
      };
    }
  }

  //******************[GET_ALL_COLLECTIONS]************************/
  @ApiOperation({ summary: 'This Api Will get all the Collections' })
  @Get('get-collections/:page_number/:items_per_page')
  async getCollections(@Param() body: GetCollectionBody): Promise<any> {
    // if no collctions ,return some message ,
    //  is this route available to all
    try {
      console.log(body);
      return await this.nftservice.getCollections(body);
    } catch (error) {
      console.log(error);
      return {
        message: 'something went Wrong',
        error,
      };
    }
  }
  /******************************[GET_NFTS_LISTED]******************/
  @ApiOperation({ summary: 'This Api will gets you Nfts that are in Auction' })
  @Get('get-nfts-listed/:listed_in')
  async getNftsListed(@Param('listed_in') listed: string): Promise<any> {
    try {
      const data = await this.nftservice.getNftsListed(listed);
      return data.length > 0 ? data : `Curently no nfts are in ${listed}`;
    } catch (error) {
      console.log(error);
      return { message: 'something went wrong in controller', error };
    }
  }
  /*******[GET_NFTS_LISTED_IN_SPECIFIC_COLLECTION]**********/
  @ApiOperation({ summary: 'This Api will gets you Nfts that are in Auction' })
  @Post('get-nfts-listed-collection')
  async getNftsListedCollection(
    @Body() Collections_listed: GetListedCollections,
  ): Promise<any> {
    try {
      console.log(Collections_listed);
      const get_nfts = await this.nftservice.getNftssListed({
        ...Collections_listed,
      });
      return get_nfts;
    } catch (error) {
      console.log(error);
      return { message: 'something went wrong in controller', error };
    }
  }
  /*******************[GET_NFTS_BY_COLLECTIONS]**********************/
  @ApiOperation({ summary: 'This Api Will get  all Nfts of the  Collections' })
  @Get('collection/:contract_address')
  async GetCollectionsByContractAddress(
    @Param() contract: getcontract,
  ): Promise<any> {
    console.log(contract.contract_address);
    try {
      console.log(contract);
      // Fetching Contract details
      const collection = await this.nftservice.getContract(contract.contract_address
      );
      console.log(collection);
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
      console.log(error);
      return {
        message: 'Something went wrong ,Our Team is Looking into it ',
        contact: 'For Any Queries You can mail us hello@gmail.com',
        error,
      };
    }
  }

  /* PENDING
  [GET NFTS WHICH ARE IN AUCTION] 
  [GET NFTS WHICH ARE IN SALE]
  [GET NFTS owned by user]
  wheather price is present on nft or not , if he owns it 
*/

  // *****************************************//
  //                POST APIs                 //
  // *****************************************//
  //
  // @Roles(Role.Admin)
  // @Post()
  //
  @ApiOperation({
    summary: 'This Api will Mint Nft and its details stores it info in DB ',
  })
  @Post('mint-nft')
  async mintNFT(@Body() body: mintToken) {
    try {
      console.log(body);
      const contract_details =
        await this.deploymentService.getContractDetailsByContractAddress(
          body.contract_address,
        );
      console.log(contract_details);
      const type = contract_details.type;
      //
      if (body.contract_type != type) {
        return `The contract is of type ${type} but you entered ${body.contract_type}`;
      }
      //
      const abiPath = path.join(
        process.cwd(),
        `src/utils/constants/${type}/${type}.abi`,
      );
      console.log(process.cwd());
      const abi = fs.readFileSync(abiPath, 'utf-8');

      // mint token using ethersjs
      const nftCntr = new ethers.Contract(
        body.contract_address,
        abi,
        this.wallet,
      ); // abi and provider to be declared
      // console.log('nftContract: ', nftCntr);
      const feeData = await this.mum_provider.getFeeData()
      const mintToken = await nftCntr.mint(
        ethers.utils.getAddress(body.token_owner),
        1,
        { gasPrice: feeData.gasPrice }
      );
      console.log('minttoken', mintToken);
      const res = await mintToken.wait(1);

      console.log('response', res);

      const tokenId = parseInt(res.events[0].args.tokenId._hex || '0');
      // const tokenURI = await nftCntr.tokenURI(parseInt(tokenId));
      const jsonData = {
        name: body.name,
        image: body.image_uri,
        description: body.description,
        external_uri: body.external_uri || '',
        attributes: body.attributes,
      };
      const jsonBlob = new Blob([JSON.stringify(jsonData)]);
      const cid = await this.storage.storeBlob(jsonBlob);
      const nftStorageUri = `https://nftstorage.link/ipfs`;
      const baseApiUri = process.env.API_BASE_URL || 'http://localhost:8080';
      console.log(baseApiUri, 'baseApiUri');
      const meta_data_url = `${baseApiUri}/metadata/${body.contract_address}/${tokenId}`;
      const ipfsMetadataUri = `${nftStorageUri}/${cid}`;
      /**********saving in Db************/

      /******for collection metadata******/
      console.log('ipfsMetadataUri', ipfsMetadataUri);

      const metadata = await this.nftservice.pushTokenUriToDocArray(
        body.contract_address,
        ipfsMetadataUri,
        tokenId,
        body.contract_type,
      );
      /**********saving in Db************/

      /******for collection Images******/
      const collection = await this.nftservice.getNftsByCollection(
        body.contract_address,
      );
      console.log(collection);
      console.log('here', collection.length);
      if (collection.length < 3) {
        console.log(collection.length);
        this.nftservice.pushImagesToCollection(
          body.contract_address,
          body.image_uri,
        );
      }
      //

      console.log('metadata');
      const arrdb = {
        contract_address: body.contract_address,
        contract_type: body.contract_type || 'NGM721PSI',
        token_id: tokenId,
        contract_details,
        meta_data_url,
        is_in_auction: false,
        token_owner: ethers.utils.getAddress(body.token_owner),
        meta_data: jsonData,
      };
      console.log(arrdb);
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
      console.log(data);
      return data;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
  // @Post('mint-batch-nft/:ERC_TOKEN')
  // async mintBatchNFT(@Param('ERC_TOKEN') ERC_TOKEN: string) {}
  // @Post('blacklist-nft/:tokenid/:cntraddr')
  // async blacklistNFT(@Param() blacklist: transactions) {}
}

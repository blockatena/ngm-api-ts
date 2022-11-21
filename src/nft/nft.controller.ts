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
  Query,
} from '@nestjs/common';
import { NftService } from './nft.service';
import { getcontract, transactions } from './dto/token-info.dto';
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
import { mintToken } from './dto/mint-token.dto';
import { DeploymentService } from 'src/deployment/deployment.service';
import * as fs from 'fs-extra';
import * as path from 'path';
import {
  GetListedCollections,
  GetCollectionsBody,
  GetNftBody,
  Paginate,
  UserNfts,
} from './dto/create-nft.dto';
import { GetCollectionsResponse } from './dto/get-collections.dto';
import { GetAllNftsResponse } from './dto/get-allnfts.dto';
import { GetAssetsResponse } from './dto/get-assets.dto';
import { GetNftsListedResponse } from './dto/get-nftslisted.dto';

require('dotenv').config();

//Global
const RPC_URL = process.env.RPC_URL;
const mum_provider = new ethers.providers.JsonRpcProvider(
  process.env.MATIC_MUMBAI_RPC_URL,
);
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const ipfsDecorator = 'ipfs://';
const token = process.env.NFT_STORAGE_KEY;
const wallet = new ethers.Wallet(process.env.PRIV_KEY, mum_provider);
const storage = new NFTStorage({ token });

@ApiTags('NGM APIs')
@Controller('nft')
// @UseGuards(RolesGuard)
export class NftController {
  constructor(
    private nftService: NftService,
    // private RedisService: RedisCliService,
    private deploymentService: DeploymentService,
  ) {}
  // File Upload
  @ApiOperation({
    summary: 'This Api will upload your asset and gets you URI of that asset',
  })
  @ApiCreatedResponse({
    status: 201,
    description: 'Successfully uploaded your asset and here is the URI of that',
  })
  @ApiCreatedResponse({
    status: 400,
    description: 'forbidden',
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
  ): Promise<string | boolean> {
    try {
      console.log(file);
      const blob = new Blob([file.buffer]);
      const toUploadFile = new File([blob], `/${file.originalname}`, {
        type: file.mimetype,
      });
      const cid = await storage.storeDirectory([toUploadFile]);
      const tokenUri = `https://nftstorage.link/ipfs/${cid}/${file.originalname}`;
      console.log({ tokenUri });
      // **********Storing in Db

      // **********
      return tokenUri;
    } catch (error) {
      return false;
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
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async getallNfts(@Param('jwt') jwt: string): Promise<any> {
    // const data = await this.RedisService.getEx('allNfts');
    // if (data) {
    //   return data;
    // }
    const fetchData = [{ cntraddr: 'cntraddr', id: 'id' }];
    // await this.RedisService.set('allNfts', JSON.stringify(fetchData));
    return fetchData;
  }

  // to fetch total number of NFTs related to the game
  @Get('total-count/:gamename')
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
  async totalCount(@Param('game-name') gameName: string): Promise<Number> {
    return 55;
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

  // ************************To fetch Contract Details**************************//
  @Get('contract-details')
  @ApiResponse({ status: 201, description: 'Fetching the contract details' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async contractDetails(): Promise<string> {
    return `Contract`;
  }

  //******************************To fetch Transactions **************************//
  @Get('get-transactions/:tokenid/:cntraddr')
  @ApiResponse({ status: 201, description: 'Fetching the Transactions' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async getransactions(@Param() transactions: transactions): Promise<string> {
    return `ddf`;
  }

  //********************* [GET ALL NFTS WITH PAGINATION]************************//
  @ApiOperation({
    summary: 'This Api will gets you all the Assets',
  })
  @ApiCreatedResponse({
    status: 201,
    description: 'Successfully fetched all assets',
  })
  @ApiCreatedResponse({
    status: 400,
    description: 'Forbidden.',
  })
  @Get('get-all-nfts/:page_number/:items_per_page')
  async getAllNfts(
    @Param() pagination: Paginate,
  ): Promise<GetAllNftsResponse | object> {
    const { page_number, items_per_page } = pagination;
    try {
      const data = await this.nftService.getAllNfts({
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
  //*******************************[GET_ASSETS_PENDING]*************************//
  @ApiOperation({
    summary:
      'This Api will gets you Specific asset given by contract_address and Token_id in Params',
  })
  @ApiCreatedResponse({
    status: 201,
    description:
      'Successfully generated assets of contract_address and Token_id',
  })
  @ApiCreatedResponse({
    status: 400,
    description: 'Forbidden',
  })
  @Get('get-nft/:contract_address/:token_id')
  async getNft(
    @Param() body: GetNftBody,
  ): Promise<GetAssetsResponse | object | string> {
    // Validations
    // check in Db
    //  return await this.nftService.
    //  const get_nft=await this.nftService.
    const { contract_address, token_id } = body;
    try {
      const is_nft_exists = await this.nftService.getNft({
        contract_address,
        token_id,
      });

      console.log(is_nft_exists);
      const nft = is_nft_exists;
      if (!is_nft_exists.nft) {
        return 'Nft is not present with that details';
      }
      console.log(is_nft_exists);
      if (is_nft_exists.nft.is_in_auction) {
        const auction = await this.nftService.getAuction(body);
        console.log(auction._id);
        const bids = await this.nftService.getBids(auction._id);
        console.log(bids);
        return {
          ...nft,
          auction,
          bids,
        };
      }
      if (is_nft_exists.is_in_sale) {
        return 'its in sale will send sale info soon';
      }
      return { ...nft };
    } catch (error) {
      console.log(error);
      return { message: 'Something went wrong' };
    }
  }
  //-------------------------******[GET_USER_NFTS]************************/
  @ApiOperation({
    summary: 'This Api will return all the NFTS for owned NFTs address',
  })
  @ApiCreatedResponse({
    status: 201,
    description: 'Successfully fetched all the NFTS for owned NFT address',
  })
  @ApiCreatedResponse({
    status: 400,
    description: 'Something went wrong',
  })
  @Get('get-user-nfts/:token_owner')
  async getUserNft(@Body() body: UserNfts): Promise<any> {
    //body is the parameter of type userNFts type
    try {
      return await this.nftService.getUserNfts(body);
    } catch (error) {
      console.log(error);
      return { message: 'something went wrong in controller', error };
    }
  }

  //******************[GET_ALL_COLLECTIONS]************************/
  @ApiOperation({ summary: 'This Api Will get all the Collections' })
  @ApiCreatedResponse({
    status: 201,
    description: 'Successfully fetched all the Collections',
  })
  @ApiCreatedResponse({
    status: 400,
    description: 'Something went wrong',
  })
  @Get('get-collections')
  async getCollections(): Promise<GetCollectionsResponse[] | object> {
    // if no collctions ,return some message ,
    //  is this route available to all
    try {
      return await this.nftService.getCollections();
    } catch (error) {
      console.log(error);
      return { message: 'something went wrong in controller', error };
    }
  }
  /******************************[GET_NFTS_LISTED]******************/
  @ApiOperation({ summary: 'This Api will gets you Nfts that are in Auction' })
  @ApiCreatedResponse({
    status: 201,
    description: 'Successfully fetched all the Nfts that are in Auction',
  })
  @ApiCreatedResponse({
    status: 400,
    description: 'Something went wrong',
  })
  @Get('get-nfts-listed/:listed_in')
  async getNftsListed(
    @Param('listed_in') listed: string,
  ): Promise<GetNftsListedResponse[] | object | string> {
    try {
      const data = await this.nftService.getNftsListed(listed);
      return data.length > 0 ? data : `Curently no nfts are in ${listed}`;
    } catch (error) {
      console.log(error);
      return { message: 'something went wrong in controller', error };
    }
  }
  /*******[GET_NFTS_LISTED_IN_SPECIFIC_COLLECTION]**********/
  @ApiOperation({ summary: 'This Api will gets you Nfts that are in Auction' })
  @ApiCreatedResponse({
    status: 201,
    description: 'Successfully fetched all the Nfts that are in auction',
  })
  @ApiCreatedResponse({
    status: 400,
    description: 'Something went wrong',
  })
  @Post('get-nfts-listed-collection')
  async getNftsListedCollection(
    @Body() Collections_listed: GetListedCollections,
  ): Promise<any> {
    try {
      console.log(Collections_listed);
      const get_nfts = await this.nftService.GetNftssListed({
        ...Collections_listed,
      });
      //

      return get_nfts;
    } catch (error) {
      console.log(error);
      return { message: 'something went wrong in controller', error };
    }
  }
  /*******************[GET_NFTS_BY_COLLECTIONS]**********************/
  @ApiOperation({ summary: 'This Api Will get  all Nfts of the  Collections' })
  @ApiCreatedResponse({
    status: 201,
    description: 'Successfully fetched all the NFts of the collection',
  })
  @ApiCreatedResponse({
    status: 400,
    description: 'Something went wrong',
  })
  @Get('collection/:contract_address')
  async getCollectionsByContractAddress(
    @Param() contract: getcontract,
  ): Promise<any> {
    console.log(contract.contract_address);
    try {
      // Fetching Contract details
      const collection = await this.nftService.GetContract({
        contract_address: contract.contract_address,
      });
      // fetching all Nfts
      const nfts = await this.nftService.getNftsByCollection(
        contract.contract_address,
      );
      // fetching data for analysis
      const total_volume = nfts.length;
      const floor_price = 0;
      const best_offer = 0;
      const owners = (
        await this.nftService.getUniqueOwners(contract.contract_address)
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
  @ApiCreatedResponse({
    status: 201,
    description: 'Successfully Minted Nft and its details ',
  })
  @ApiCreatedResponse({
    status: 400,
    description: 'Something went wrong',
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
      const nftCntr = new ethers.Contract(body.contract_address, abi, wallet); // abi and provider to be declared
      // console.log('nftContract: ', nftCntr);
      const mintToken = await nftCntr.mint(body.token_owner, 1);
      const res = await mintToken.wait(1);
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
      const cid = await storage.storeBlob(jsonBlob);
      const nftStorageUri = `https://nftstorage.link/ipfs`;
      const baseApiUri = process.env.API_BASE_URL || 'http://localhost:8080';
      console.log(baseApiUri, 'baseApiUri');
      const meta_data_url = `${baseApiUri}/metadata/${body.contract_address}/${tokenId}`;
      const ipfsMetadataUri = `${nftStorageUri}/${cid}`;
      /**********saving in Db************/

      /******for collection metadata******/
      console.log('ipfsMetadataUri', ipfsMetadataUri);

      const metadata = await this.nftService.pushTokenUriToDocArray(
        body.contract_address,
        ipfsMetadataUri,
        tokenId,
        body.contract_type,
      );
      /**********saving in Db************/

      /******for collection Images******/
      const collection = await this.nftService.getNftsByCollection(
        body.contract_address,
      );
      console.log(collection);
      console.log('here', collection.length);
      if (collection.length < 3) {
        console.log(collection.length);
        this.nftService.PushImagesToCollection(
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
        meta_data_url: meta_data_url,
        is_in_auction: false,
        token_owner: body.token_owner,
        meta_data: jsonData,
      };
      console.log(arrdb);

      const data = await this.nftService.createNFT(arrdb);
      // ****************
      return data;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
  @Post('mint-batch-nft/:ERC_TOKEN')
  async mintBatchNFT(@Param('ERC_TOKEN') ERC_TOKEN: string) {}
  @Post('blacklist-nft/:tokenid/:cntraddr')
  async blacklistNFT(@Param() blacklist: transactions) {}
}

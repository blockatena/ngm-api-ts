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
import { baycAbi } from './abi';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/guards/roles.decorator';
import { Role } from 'src/guards/roles.enum';
import { NFTStorage, File, Blob } from 'nft.storage';
import { mintToken } from './nftitems/mintToken.dto';
import { Bucket } from 'src/textile/helper/textileHelper';
import { DeploymentService } from 'src/deployment/deployment.service';
import * as fs from 'fs-extra';
import * as path from 'path';
import {
  get_collections_body,
  get_Nft_body,
  paginate,
} from './nftitems/createNft.dto';

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

@ApiTags('NGM APIs')
@Controller('nft')
// @UseGuards(RolesGuard)
export class NftController {
  constructor(
    private nftservice: NftService,
    // private RedisService: RedisCliService,
    private deploymentService: DeploymentService,
  ) {}
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

      const storage = new NFTStorage({ token });
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
  async totalcount(@Param('game-name') gameName: string): Promise<Number> {
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

  // To fetch Contract Details
  @Get('contract-details')
  @ApiResponse({ status: 201, description: 'Fetching the contract details' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async ContractDetails(): Promise<string> {
    return `Contract`;
  }

  @Get('get-transactions/:tokenid/:cntraddr')
  @ApiResponse({ status: 201, description: 'Fetching the Transactions' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async Getransactions(@Param() transactions: transactions): Promise<string> {
    return `ddf`;
  }

  @ApiOperation({
    summary: 'This Api will gets you all the Assets',
  })
  /** [GET ALL NFTS WITH PAGINATION]*/
  @Get('Get-all-nfts/:page_number/:items_per_page')
  async GetAllNfts(@Param() pagination: paginate): Promise<any> {
    const { page_number, items_per_page } = pagination;
    try {
      const data = await this.nftservice.GetAllNfts({
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
      'This Api will gets you Specific asset given by contract_address and Token_id in Params',
  })
  // ***************/
  // get owner assets pending
  //************ */
  @Get('get-nft/:contract_address/:token_id')
  async GetNft(@Param() body: get_Nft_body): Promise<any> {
    // Validations
    // check in Db
    //  return await this.nftservice.
    //  const get_nft=await this.nftservice.
    const { contract_address, token_id } = body;
    try {
      const data = await this.nftservice.GetNft({ contract_address, token_id });
      if (!data) {
        return 'Nft is not present with that details';
      }
      return data;
    } catch (error) {
      console.log(error);
      return { message: 'Something went wrong' };
    }
  }

  //******************[GET_ALL_COLLECTIONS]************************/
  @ApiOperation({ summary: 'This Api Will get all the Collections' })
  @Get('get-collections')
  async GetCollections(): Promise<any> {
    // if no collctions ,return some message ,
    //  is this route available to all
    return await this.nftservice.getcollections();
  }

  /*******************[GET_NFTS_BY_COLLECTIONS]**********************/
  @ApiOperation({ summary: 'This Api Will get  all Nfts of the  Collections' })
  @Get('collection/:contract_address')
  async GetCollectionsByContractAddress(
    @Param() contract: getcontract,
  ): Promise<any> {
    console.log(contract.contract_address);
    try {
      // Fetching Contract details
      const collection = await this.nftservice.GetContract({
        contractaddress: contract.contract_address,
      });
      // fetching all Nfts
      const nfts = await this.nftservice.get_Nfts_by_Collection(
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
      const buckInstance = new Bucket();
      const contract_details =
        await this.deploymentService.getContractDetailsByContractAddress(
          body.contract_address,
        );
      const type = contract_details.type;
      const abiPath = path.join(
        process.cwd(),
        `src/utils/constants/${type}/${type}.abi`,
      );
      console.log(process.cwd());
      const abi = fs.readFileSync(abiPath, 'utf-8');

      // mint token using ethersjs
      const nftCntr = new ethers.Contract(body.contract_address, abi, wallet); // abi and provider to be declared
      console.log('nftContract: ', nftCntr);
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
      const response = await buckInstance.pushJSON(
        String(tokenId),
        jsonData,
        body.contract_address,
      );
      const textileUri =
        'https://bafzbeigcbumfj5l2uerqp4pd76pctqrklhdqsupmhjydp6hriwb42rivbq.textile.space';
      const meta_data_url = `${textileUri}/${body.contract_address}/${tokenId}.json`;

      /**********saving in Db************/

      /******for collection Images******/
      const collection = await this.nftservice.get_Nfts_by_Collection(
        body.contract_address,
      );
      console.log(collection);
      console.log('here', collection.length);
      if (collection.length < 2) {
        console.log(collection.length);
        this.nftservice.PushImagesToCollection(
          body.contract_address,
          body.image_uri,
        );
      }
      //
      const arrdb = {
        contract_address: body.contract_address,
        contract_type: body.contract_type || 'NGM721PSI',
        token_id: tokenId,
        meta_data_url: meta_data_url,
        is_in_auction: false,
        token_owner: body.token_owner,
      };
      console.log(arrdb);

      const data = await this.nftservice.createNFT(arrdb);
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

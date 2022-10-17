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
import { getnft, transactions } from './nftitems/tokeninfo.dto';
import { ethers } from 'ethers';
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RedisCliService } from '../redis-cli/redis-cli.service';
import { baycAbi } from './abi';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/guards/roles.decorator';
import { Role } from 'src/guards/roles.enum';
import { NFTStorage, File, Blob } from 'nft.storage';
import { mintToken } from './nftitems/mintToken.dto';

require('dotenv').config();

//Global
const RPC_URL = process.env.RPC_URL;
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const ipfsDecorator = 'ipfs://';
const token = process.env.NFT_STORAGE_KEY;

@ApiTags('NGM APIs')
@Controller('nft')
// @UseGuards(RolesGuard)
export class NftController {
  constructor(
    private nftservice: NftService,
    private RedisService: RedisCliService,
  ) {}
  // File Upload
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
      return cid;
    } catch (error) {
      return false;
    }
  }

  //
  // To Get all All NFTs in the Db
  // For Docs
  // You can Specify access to single person or multiple persons
  // You can give permissions to as many people as you want
  @SetMetadata('roles', [Role.Admin, Role.User])
  @Get('get-all-nfts/:jwt')
  @ApiOperation({ summary: 'To Get All Nfts' })
  @ApiCreatedResponse({
    status: 201,
    description: 'The records has been fetched successfully.',
    type: [getnft],
  })
  //
  // Logic
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async getallNfts(@Param('jwt') jwt: string): Promise<any> {
    const data = await this.RedisService.getEx('allNfts');
    if (data) {
      return data;
    }
    const fetchData = [{ cntraddr: 'cntraddr', id: 'id' }];
    await this.RedisService.set('allNfts', JSON.stringify(fetchData));
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

  //   Get route
  @Get(':cntraddr/:id')
  @ApiResponse({
    status: 201,
    description: 'To fetch the details the Token URI',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async getTokenImage(@Param() NftData: getnft): Promise<string> {
    console.log('The data is: ', NftData.cntraddr, NftData.id);
    const nftCntr = new ethers.Contract(NftData.cntraddr, baycAbi, provider); // abi and provider to be declared
    // const tokenData = erc20.functions.tokenOfOwnerByIndex(NftData.id);
    console.log('Contract Instance: ', nftCntr);
    const tokenURI = await nftCntr.tokenURI(NftData.id);
    console.log('TokenURI: ', tokenURI);
    return `your id is ${NftData.cntraddr} and your name is  ${NftData.id}`;
  }

  // To fetch Contract Details
  @Get('contract-details')
  @ApiResponse({ status: 201, description: 'Fetching the contract details' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async contractdetails(): Promise<string> {
    return `Contract`;
  }

  @Get('get-transactions/:tokenid/:cntraddr')
  @ApiResponse({ status: 201, description: 'Fetching the Transactions' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async getransactions(@Param() transactions: transactions): Promise<string> {
    return `ddf`;
  }

  // *****************************************//
  //                POST APIs                 //
  // *****************************************//

  //
  // @Roles(Role.Admin)
  // @Post()
  //
  @Post('mint-nft/:ERC_TOKEN')
  async mintNFT(@Body('ERC_TOKEN') ERC_TOKEN: mintToken) {}

  @Post('mint-batch-nft/:ERC_TOKEN')
  async mintBatchNFT(@Param('ERC_TOKEN') ERC_TOKEN: string) {}
  @Post('put-for-sale/:tokenid/:cntraddr')
  async putForSale(@Param() sale: transactions) {}
  @Post('blacklist-nft/:tokenid/:cntraddr')
  async blacklistNFT(@Param() blacklist: transactions) {}
}

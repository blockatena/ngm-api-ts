import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { NftService } from './nft.service';
import { getnft, transactions } from './nftitems/tokeninfo.dto';
import { ethers } from 'ethers';
import {
  ApiCreatedResponse,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RedisCliService } from '../redis-cli/redis-cli.service';
import { baycAbi } from './abi';
require('dotenv').config();

//Global
const RPC_URL = process.env.RPC_URL;
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const ipfsDecorator = 'ipfs://';
@ApiTags('NGM APIs')
@Controller('nft')
export class NftController {
  constructor(
    private nftservice: NftService,
    private RedisService: RedisCliService,
  ) {}

  // To Get all All NFTs in the Db
  // For Docs
  @Get('get-all-nfts')
  @ApiOperation({ summary: 'To Get All Nfts' })
  @ApiCreatedResponse({
    status: 201,
    description: 'The records has been fetched successfully.',
    type: [getnft],
  })
  //
  // Logic
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async getallNfts(): Promise<any> {
    const data = await this.RedisService.getEx('allNfts');
    if (data) {
      return data;
    }
    const fetchData = [{ cntraddr: 'cntraddr', id: 'id' }];
    await this.RedisService.setEx('allNfts', JSON.stringify(fetchData));
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
  async mintNFT(@Param('ERC_TOKEN') ERC_TOKEN: string) {}

  @Post('mint-batch-nft/:ERC_TOKEN')
  async mintBatchNFT(@Param('ERC_TOKEN') ERC_TOKEN: string) {}
  @Post('put-for-sale/:tokenid/:cntraddr')
  async putForSale(@Param() sale: transactions) {}
  @Post('blacklist-nft/:tokenid/:cntraddr')
  async blacklistNFT(@Param() blacklist: transactions) {}
}

import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { NftService } from './nft.service';
import { tokeninfo } from './items/tokeninfo.dto';
import { ethers } from 'ethers';
import { ApiTags } from '@nestjs/swagger';
import { address } from './items/address.dto';
import { getusertoken } from './items/getusertoken';
import baycAbi from './abi';
require('dotenv').config();

//Global
const RPC_URL = process.env.RPC_URL;
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const ipfsDecorator = 'ipfs://';

@ApiTags('NGM APIs')
@Controller('nft')
export class NftController {
  constructor(private nftservice: NftService) {}

  //Get totalSupply
  @Get('totalSupply/:cntraddr')
  async totalSupply(@Param() Contract: address): Promise<any> {
    const nftCntr = new ethers.Contract(Contract.cntraddr, baycAbi, provider);
    const totalSupply = await nftCntr.totalSupply();
    return parseInt(totalSupply._hex);
  }

  //get image of the nft
  @Get('/image/:cntraddr/:id')
  async getTokenImage(@Param() NftData: tokeninfo): Promise<any> {
    const nftCntr = new ethers.Contract(NftData.cntraddr, baycAbi, provider);
    const tokenURI = await nftCntr.tokenURI(NftData.id);
    console.log('TokenURI: ', tokenURI);
    let ipfsFlag = tokenURI.includes(ipfsDecorator);
    const cid = ipfsFlag ? tokenURI.split(ipfsDecorator)[1] : tokenURI;
    console.log(cid, ipfsFlag);
    const metadata = await this.nftservice.getMetadata(cid, ipfsFlag);
    const imageUrl = this.nftservice.getImageUrl(metadata.data.image);
    if (metadata) return { image: imageUrl };
    return `your id is ${NftData.cntraddr} and your name is  ${NftData.id}`;
  }

  //get metadata of the nft
  @Post('/data/')
  async getTokenData(@Body() NftData: tokeninfo): Promise<any> {
    console.log('NftData: ', NftData.cntraddr, NftData.id);
    const nftCntr = new ethers.Contract(NftData.cntraddr, baycAbi, provider);
    const tokenURI = await nftCntr.tokenURI(NftData.id);
    console.log('nftCntr: ', tokenURI);
    const ipfsFlag = tokenURI.includes(ipfsDecorator);
    const cid = ipfsFlag ? tokenURI.split(ipfsDecorator)[1] : tokenURI;
    console.log(cid, ipfsFlag);
    const metadata = await this.nftservice.getMetadata(cid, ipfsFlag);
    console.log('TokenURI: ', metadata.data);
    if (metadata) {
      return metadata.data;
    }
    return {
      res: `your id is ${NftData.cntraddr} and your name is  ${NftData.id}`,
    };
  }
  //get token owned by an address
  @Post('/user')
  async getTokenOfOwner(@Body() NftData: getusertoken): Promise<any[]> {
    console.log('NftData: ', NftData.cntraddr, NftData.walletaddr);
    const nftCntr = new ethers.Contract(NftData.cntraddr, baycAbi, provider);
    const balance = await nftCntr.balanceOf(NftData.walletaddr);
    const tokenBalance = parseInt(balance._hex);
    let tokens = [];
    for (let i = 0; i < tokenBalance; i++) {
      const tokenId = await nftCntr.tokenOfOwnerByIndex(
        NftData.walletaddr,
        i,
      );
      tokens.push(parseInt(tokenId._hex));    
    }
    return tokens;
    // const ipfsFlag = tokenURI.includes(ipfsDecorator);
    // const cid = ipfsFlag ? tokenURI.split(ipfsDecorator)[1] : tokenURI;
    // console.log(cid, ipfsFlag);
    // const metadata = await this.nftservice.getMetadata(cid, ipfsFlag);
    // console.log('TokenURI: ', metadata.data);
    // if (metadata) {
    //   return metadata.data;
    // }
    // return {
    //   res: `your id is ${NftData.cntraddr} and your name is  ${NftData.id}`,
    // };
  }
}

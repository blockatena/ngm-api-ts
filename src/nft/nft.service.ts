import { HttpService } from '@nestjs/axios';
import { Body, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NftDocument, NftSchema } from 'src/schemas/nft.schema';
import { createNFT, getNft } from './nftitems/createNft.dto';

@Injectable()
export class NftService {
  constructor(
    private readonly httpService: HttpService,
    @InjectModel(NftSchema.name) private NftModel: Model<NftDocument>,
  ) {
    NftModel;
  }
  async getMetadata(cid: string, ipfsFlag: boolean): Promise<any> {
    return await this.httpService.axiosRef.get(
      ipfsFlag ? 'https://ipfs.io/ipfs/' + cid : cid,
    );
  }

  getImageUrl(url: string): string {
    return url.includes('ipfs://')
      ? 'https://ipfs.io/ipfs/' + url.split('ipfs://')[1]
      : url;
  }

  tokeninfo() {
    return { msg: 'Metadata Fetched' };
  }

  async createNFT(nftData: createNFT): Promise<any> {
    return await (await this.NftModel.create(nftData)).save();
  }

  async getallnfts() {
    return await this.NftModel.find();
  }

  // test
  // async get_Nft(details: getNft): Promise<any> {
  //   console.log(details);
  //   return await this.NftModel.findOne(details);
  // }
  // test
}

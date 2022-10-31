import { HttpService } from '@nestjs/axios';
import { Body, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ContractDocument, ContractSchema } from 'src/schemas/contract.schema';
import { NftDocument, NftSchema } from 'src/schemas/nft.schema';
import { createNFT, getNft } from './nftitems/createNft.dto';

@Injectable()
export class NftService {
  constructor(
    @InjectModel(ContractSchema.name)
    private ContractModel: Model<ContractDocument>,
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
  async createNFT(data: any): Promise<any> {
    return await (await this.NftModel.create(data)).save();
  }
  async getallnfts() {
    return await this.NftModel.find();
  }

  async getcollections() {
    return await this.ContractModel.find({});
  }
  async get_Nfts_by_Collection(Contract_Address: string): Promise<any> {
    return await this.NftModel.find({ contract_address: Contract_Address });
  }
}

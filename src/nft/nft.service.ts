import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

@Injectable()
export class NftService {
  constructor(private readonly httpService: HttpService) {}

  async getMetadata(cid: string, ipfsFlag: boolean): Promise<any> {
    return await this.httpService.axiosRef.get(
      ipfsFlag ? 'https://ipfs.io/ipfs/' + cid : cid,
    );
  }

  getImageUrl(url: string) {
    
  }

  tokeninfo() {
    return { msg: 'Metadata Fetched' };
  }
}

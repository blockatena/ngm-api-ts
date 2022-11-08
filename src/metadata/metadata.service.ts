import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { metadata, metadataDocument } from 'src/schemas/metadata.schema';

@Injectable()
export class MetadataService {
  constructor(
    private readonly httpService: HttpService,
    @InjectModel(metadata.name) private MetadataModel: Model<metadataDocument>,
  ) {
    MetadataModel;
  }

  async getMetadata(
    contract_address: string,
    token_id: string,
    chain = 'Polygon',
  ): Promise<any> {
    const metadataDoc = await this.MetadataModel.findOne({
      contract_address,
      chain,
    });
    if (metadataDoc) {
      const uri = metadataDoc.tokenUri[parseInt(token_id)].uri;
      const res = await this.httpService.axiosRef.get(uri);
      return res.data;
    } else {
      return 'Token Doesnt exist';
    }
  }
}

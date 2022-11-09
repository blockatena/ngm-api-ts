import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CronjobService } from 'src/cronjob/cronjob.service';
import { AuctionSchema, AuctionDocument } from 'src/schemas/auction.schema';
import { BidSchema, BidDocument } from 'src/schemas/bid.schema';
import { ContractSchema, ContractDocument } from 'src/schemas/contract.schema';
import { NftSchema, NftDocument } from 'src/schemas/nft.schema';
import { OfferSchema, OfferDocument } from 'src/schemas/offer.schema';
import { SalesSchema, SalesDocument } from 'src/schemas/sales.schema';
import { DeleteKeyBody } from './dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(ContractSchema.name)
    private ContractModel: Model<ContractDocument>,
    @InjectModel(AuctionSchema.name)
    private AuctionModel: Model<AuctionDocument>,
    @InjectModel(BidSchema.name) private BidModel: Model<BidDocument>,
    @InjectModel(NftSchema.name) private NftModel: Model<NftDocument>,
    @InjectModel(SalesSchema.name) private SalesModel: Model<SalesDocument>,
    @InjectModel(OfferSchema.name) private OfferModel: Model<OfferDocument>,
  ) {
    AuctionModel;
    BidModel;
    NftModel;
    ContractModel;
    SalesModel;
    OfferModel;
  }
  async EmptyCollection(collection: string): Promise<any> {
    // if (collection == 'NftModel') this.NftModel.deleteMany({});
    // if (collection == 'BidModel') this.BidModel.deleteMany({});
    // if (collection == 'AuctionModel') this.AuctionModel.deleteMany({});
    // if (collection == 'ContractModel') this.ContractModel.deleteMany({});
    // if (collection == 'SalesModel') this.SalesModel.deleteMany({});
    // if (collection == 'OfferModel') this.OfferModel.deleteMany({});
  }
  async UpdateCollection(body: any): Promise<any> {}
  async UpdateNft(body: any, updatee: any): Promise<any> {
    return await this.NftModel.updateMany(body, { $set: updatee });
  }
  async DeleteKey(body: DeleteKeyBody): Promise<any> {
    const { key } = body;

    return this.NftModel.updateMany(
      {},
      { $unset: { contract_details: 1 } },
      { multi: true },
    ).exec(function (err) {
      console.log(err);
    });
  }
  async GetNft(body: any): Promise<any> {}
  async GetCollection(body: any): Promise<any> {
    // return await this.ContractModel.;
  }
  async GetSale(body: any): Promise<any> {}
  async GetAuction(body: any): Promise<any> {}
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CronjobService } from 'src/services/cronjob.service';
import { DeleteCronBody, DeleteKeyBody } from './dto/admin.dto';
import {
  ContractSchema,
  ContractDocument,
} from 'src/core/deployment/schema/contract.schema';
import {
  AuctionSchema,
  AuctionDocument,
} from 'src/core/marketplace/schema/auction.schema';
import { BidSchema, BidDocument } from 'src/core/marketplace/schema/bid.schema';
import {
  OfferSchema,
  OfferDocument,
} from 'src/core/marketplace/schema/offer.schema';
import {
  SalesSchema,
  SalesDocument,
} from 'src/core/marketplace/schema/sales.schema';
import { NftSchema, NftDocument } from 'src/core/nft/schema/nft.schema';
import {
  Offer1155Schema,
  Offer1155Document,
} from 'src/core/nft/schema/offer1155.schema';
import {
  Sale1155Schema,
  Sale1155Document,
} from 'src/core/nft/schema/sale1155.schema';
@Injectable()
export class AdminService {
  constructor(
    private Cron_job: CronjobService,
    @InjectModel(ContractSchema.name)
    private ContractModel: Model<ContractDocument>,
    @InjectModel(AuctionSchema.name)
    private AuctionModel: Model<AuctionDocument>,
    @InjectModel(BidSchema.name) private BidModel: Model<BidDocument>,
    @InjectModel(NftSchema.name) private NftModel: Model<NftDocument>,
    @InjectModel(SalesSchema.name) private SalesModel: Model<SalesDocument>,
    @InjectModel(OfferSchema.name) private OfferModel: Model<OfferDocument>,
    @InjectModel(Offer1155Schema.name)
    private Offer1155Model: Model<Offer1155Document>,
    @InjectModel(Sale1155Schema.name)
    private Sale1155Model: Model<Sale1155Document>,
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
    const { key, id } = body;

    return this.NftModel.updateMany(
      { _id: id },
      { $unset: { meta_data: 1 } },
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
  async deleteCron(cronjob_id: DeleteCronBody): Promise<any> {
    return this.Cron_job.deleteCron(cronjob_id.cron_job_id);
  }
}

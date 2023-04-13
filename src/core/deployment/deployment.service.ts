import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ContractSchema, ContractDocument } from './schema/contract.schema';

@Injectable()
export class DeploymentService {
  constructor(
    @InjectModel(ContractSchema.name)
    private ContractModel: Model<ContractDocument>,
  ) {
    ContractModel;
  }

  async ContractCount(ownerAddress: string): Promise<any> {
    return await this.ContractModel.count({
      ownerAddress: ownerAddress,
    });
  }

  async createContract(data: any): Promise<any> {
    console.log('from data', data);
    try {
      return await this.ContractModel.create(data);
    } catch (error) {
      return { mesasge: 'problem in service', error };
    }
  }

  async getallContractData(): Promise<any> {
    return await this.ContractModel.find({});
  }
  async getContractByOwnerAddr(ownerAddress: string): Promise<any> {
    return await this.ContractModel.find({ ownerAddress: ownerAddress });
  }
  async getContractDetailsByContractAddress(cntraddr: string): Promise<any> {
    console.log(cntraddr);
    return await this.ContractModel.findOne({ contract_address: cntraddr });
  }
}

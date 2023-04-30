import { Injectable } from '@nestjs/common';
import { CommonService } from 'src/common/common.service';
import { TransactionStatusEnum } from './enum/transaction.status.enum';
import { TransactionTypeEnum } from './enum/transaction.type.enum';
import { TransactionModeEnum } from './enum/transaction.mode.enum';
import { TransactionType } from './types/transaction.type';
import {
  TransactionDocument,
  TransactionSchema,
} from './schema/transaction.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChainEnum } from 'src/common/enum/chain.enum';
import { CurrencyEnum } from 'src/common/enum/currency.enum';

@Injectable()
export class PaymentService {
  constructor(
    private readonly commonService: CommonService,
    @InjectModel(TransactionSchema.name)
    private readonly TransactionModel: Model<TransactionDocument>,
  ) {}
  async validateTransaction({
    chain,
    transaction_hash,
  }: {
    chain: ChainEnum;
    transaction_hash: string;
  }): Promise<any> {
    try {
      //based on chain validate transaction
      const ENVIRONMENT = await this.commonService.getEnvironmentVar(
        'ENVIRONMENT',
      );
      console.log(ENVIRONMENT);
      const isTransactionExists = await this.TransactionModel.findOne({
        transactionId: transaction_hash,
      });
      if (isTransactionExists) {
        return { status: isTransactionExists.status };
      }
      const RPC_URL = await this.commonService.getRpcUrl({
        chain,
      });
      console.log(RPC_URL);
      const currency = await this.getCurrency(chain);
      const { from, to, amount, error, message } =
        await this.commonService.getTransaction({ RPC_URL, transaction_hash });
        //createTransaction
        //addSubscription
      if (error) {
        return message;
      }
      const transactionObj = {
        from,
        to,
        currency,
        transactionMode: TransactionModeEnum.WALLET,
        amount,
        status: TransactionStatusEnum.VERIFIED,
        transactionId: transaction_hash,
        transactionType: TransactionTypeEnum.SUBSCRIPTION,
      };
      await this.createTransaction(transactionObj);
      return {
        status: TransactionStatusEnum.VERIFIED,
      };
    } catch (error) {
      return {
        error,
        message: 'Something went wrong',
      };
    }
  }

  async createTransaction(transactionObj: TransactionType): Promise<any> {
    try {
      return await this.TransactionModel.create(transactionObj);
    } catch (error) {
      return {
        error,
        message: 'Something went wrong',
      };
    }
  }
  async getCurrency(chain: ChainEnum): Promise<any> {
    switch (chain) {
      case ChainEnum.ETHEREUM:
        return CurrencyEnum.ETH;
      case ChainEnum.FILECOIN:
        return CurrencyEnum.FIL;
      case ChainEnum.POLYGON:
        return CurrencyEnum.MATIC;
      case ChainEnum.GOERLI:
        return CurrencyEnum.GOERLI_ETH;
      case ChainEnum.HYPERSPACE:
        return CurrencyEnum.FIL;
      case ChainEnum.MUMBAI:
        return CurrencyEnum.MATIC;
      default:
        return 'INVALID CURRENCY';
    }
  }
}

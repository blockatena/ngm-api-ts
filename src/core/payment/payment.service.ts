import { Injectable } from '@nestjs/common';
import { CommonService } from 'src/common/common.service';
import { TransactionStatusEnum } from './enum/transaction.status.enum';
import { TransactionTypeEnum } from './enum/transaction.type.enum';
import { CurrencyEnum } from './enum/currency.enum';
import { TransactionModeEnum } from './enum/transaction.mode.enum';
import { TransactionType } from './types/transaction.type';
import { TransactionDocument, TransactionSchema } from './schema/transaction.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class PaymentService {
    constructor(private readonly commonService: CommonService,
        @InjectModel(TransactionSchema.name)
        private readonly TransactionModel: Model<TransactionDocument>) {

    }
    async validateTransaction({ chain, transactionHash }: { chain: string, transactionHash: string }): Promise<any> {
        try {
            //based on chain validate transaction
            const ENVIRONMENT = await this.commonService.getEnvironmentVar('ENVIRONMENT');
            console.log(ENVIRONMENT);
            const RPC_URL = await this.commonService.getRpcUrl({ ENVIRONMENT, chain });
            console.log(RPC_URL);
            const { from, to, amount } = await this.commonService.getTransaction({ RPC_URL, transactionHash });
            //createTransaction
            //addSubscription
            const transactionObj = {
                from,
                to,
                currency: CurrencyEnum.MATIC,
                transactionMode: TransactionModeEnum.WALLET,
                amount,
                status: TransactionStatusEnum.SUCCESSFUL,
                transactionType: TransactionTypeEnum.SUBSCRIPTION,
            }
            await this.createTransaction(transactionObj);
            return {
                transactionStatus: TransactionStatusEnum.VERIFIED
            }
        } catch (error) {
            return {
                error,
                message: "Something went wrong"
            }
        }
    }

    async createTransaction(transactionObj: TransactionType): Promise<any> {
        try {
            return await this.TransactionModel.create(transactionObj);
        } catch (error) {
            return {
                error,
                message: "Something went wrong"
            }
        }
    }
}

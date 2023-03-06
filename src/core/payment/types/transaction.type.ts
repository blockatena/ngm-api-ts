import { CurrencyEnum } from "../enum/currency.enum";
import { TransactionModeEnum } from "../enum/transaction.mode.enum";
import { TransactionStatusEnum } from "../enum/transaction.status.enum";
import { TransactionTypeEnum } from "../enum/transaction.type.enum";

export type TransactionType = {
    from: string;
    to: string;
    currency: CurrencyEnum;
    transactionMode: TransactionModeEnum;
    amount: number;
    status: TransactionStatusEnum;
    transactionType: TransactionTypeEnum;
}
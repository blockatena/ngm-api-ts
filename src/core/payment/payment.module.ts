import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { CommonModule } from 'src/common/common.module';
import { MongooseModule } from '@nestjs/mongoose';
import {
  TransactionSchema,
  transactionSchema,
} from './schema/transaction.schema';

@Module({
  imports: [
    CommonModule,
    MongooseModule.forFeature([
      { name: TransactionSchema.name, schema: transactionSchema },
    ]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}

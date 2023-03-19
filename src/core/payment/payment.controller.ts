import { Body, Controller, Post } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ValidateTransaction } from './dto/validate.transaction.dto';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('validate-transaction')
  async validateTransaction(@Body() body: ValidateTransaction): Promise<any> {
    return await this.paymentService.validateTransaction(body);
  }
}

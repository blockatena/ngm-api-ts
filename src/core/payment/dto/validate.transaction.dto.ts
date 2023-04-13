import { ApiProperty } from '@nestjs/swagger';
import { ChainEnum } from 'src/common/enum/chain.enum';

export class ValidateTransaction {
  @ApiProperty()
  chain: ChainEnum;
  @ApiProperty()
  transaction_hash: string;
}

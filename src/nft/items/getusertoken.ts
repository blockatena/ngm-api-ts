import { ApiProperty } from '@nestjs/swagger';

export class getusertoken {
  @ApiProperty()
  readonly cntraddr: string;
  @ApiProperty()
  readonly walletaddr: string;
}

import { ApiProperty } from '@nestjs/swagger';

export class address {
  @ApiProperty()
  readonly cntraddr: string;
}

import { ApiProperty } from '@nestjs/swagger';

export class tokeninfo {
  @ApiProperty()
  readonly cntraddr: string;
  @ApiProperty()
  readonly id: string;
}

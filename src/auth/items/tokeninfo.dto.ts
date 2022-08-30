import { ApiProperty } from '@nestjs/swagger';

export class getnft {
  @ApiProperty()
  readonly cntraddr: string;
  @ApiProperty()
  readonly id: string;
}

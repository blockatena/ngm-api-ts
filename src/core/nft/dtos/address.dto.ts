import { ApiProperty } from '@nestjs/swagger';

export class address {
  @ApiProperty()
  readonly cntraddr: string;
}
export class UpdateOwner {
  contract_address: string;
  // infuture we may add chain also
  token_owner: string;
}

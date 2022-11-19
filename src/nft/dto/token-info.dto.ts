import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';

@ApiExtraModels()
export class getcontract {
  @ApiProperty({
    description: 'Address of the Collection',
    example: '0xE0B8BF7DB5Cd76033f036658De37a06D6C014D9C',
  })
  contract_address: string;
}

@ApiExtraModels()
export class transactions {
  @ApiProperty()
  readonly 'token-id': string;

  @ApiProperty()
  readonly 'cntr-addr': string;
}

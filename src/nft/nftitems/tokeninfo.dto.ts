import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';

@ApiExtraModels()
export class getcontract {
  @ApiProperty({
    description: 'Address of the Collection',
    default: '0xE0B8BF7DB5Cd76033f036658De37a06D6C014D9C',
  })
  contract_address: string;
}

@ApiExtraModels()
export class transactions {
  @ApiProperty({default:'1'})
  readonly 'token-id': string;

  @ApiProperty({default:'0x31b9879FC5853C22487b99Bf97B1Bf48eAeA88d2'})
  readonly 'cntr-addr': string;
}

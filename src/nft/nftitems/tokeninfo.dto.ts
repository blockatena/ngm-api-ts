import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';

@ApiExtraModels()
export class getcontract {
  @ApiProperty({
    description: 'Address of the Collection',
    example: "44fdfsdfdsfsfsdgssd",
  })
  readonly contract_address: string;
}


@ApiExtraModels()
export class transactions{
  @ApiProperty()
    readonly "token-id": string;
 
  @ApiProperty()
    readonly "cntr-addr": string;

     
}


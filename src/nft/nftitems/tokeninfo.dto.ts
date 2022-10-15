import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';

@ApiExtraModels()
export class getnft {
  @ApiProperty({
    description: 'Id of Your Wallet',
    example: "44fdfsdfdsfsfsdgssd",
  })
  readonly cntraddr: string;
  @ApiProperty({
    description: 'Counter Address Of the Wallet ( Wallet Address of the others )',
    example: "dfsed454fdfsdfdsfsfsdgssd"
  })
  readonly id: string;
}


@ApiExtraModels()
export class transactions{
  @ApiProperty()
    readonly "token-id": string;
 
  @ApiProperty()
    readonly "cntr-addr": string;

     
}


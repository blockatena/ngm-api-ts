import { ApiProperty } from '@nestjs/swagger';

export class getusertoken {
  @ApiProperty({default:'0x31b9879FC5853C22487b99Bf97B1Bf48eAeA88d2'})
  readonly cntraddr: string;
  @ApiProperty({default:'0x2A8b77DF421106C8fCdBE08697c949D519f4c05a'})
  readonly walletaddr: string;
}

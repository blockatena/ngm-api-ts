import { ApiProperty } from '@nestjs/swagger';

export class GetOwner {
  @ApiProperty({ default: '0x8f27D09be98d2583E0322C25C8F2149E4AA2635C' })
  readonly contract_address: string;
  @ApiProperty({ default: 28 })
  readonly token_id: number;
}

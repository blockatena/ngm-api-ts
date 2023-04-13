import { ApiProperty } from '@nestjs/swagger';

export class GetItemActivity {
  @ApiProperty({ example: '0xc5195CDa9ED7dC18AFA7b69Da90Bbaf427C1ca3F' })
  contract_address: string;
  @ApiProperty({ example: 1 })
  token_id: number;
  @ApiProperty({ example: 5 })
  page_number: number;
  @ApiProperty({ example: 5 })
  items_per_page: number;
}

import { ApiProperty } from '@nestjs/swagger';

export class GetNotification {
  @ApiProperty()
  wallet_address: string;
  @ApiProperty()
  page_number: number;
  @ApiProperty()
  items_per_page: number;
}

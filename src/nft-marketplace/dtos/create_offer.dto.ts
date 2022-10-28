import { ApiProperty } from '@nestjs/swagger';
export class create_Offer_Body {
  @ApiProperty()
  token_id;
  @ApiProperty()
  offer_currency;
  @ApiProperty()
  offer_price;
}

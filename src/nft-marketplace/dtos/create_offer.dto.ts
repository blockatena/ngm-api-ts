import { ApiProperty } from '@nestjs/swagger';
export class create_Offer_Body {
  @ApiProperty()
  sale_id: string;
  @ApiProperty()
  contract_address: string;
  @ApiProperty()
  token_id: string;
  @ApiProperty()
  offer_price: string;
  @ApiProperty()
  offer_person_address: string;
}
export class accept_Offer_Body {
  @ApiProperty()
  sale_id: string;
  @ApiProperty()
  offer_id: string;
}
export class get_all_offers_Body {
  @ApiProperty()
  sale_id: string;
}

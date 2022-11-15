import { ApiProperty } from '@nestjs/swagger';
export class CreateOfferBody {
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
export class AcceptOfferBody {
  @ApiProperty()
  sale_id: string;
  @ApiProperty()
  offer_id: string;
}
export class GetAllOffersBody {
  @ApiProperty()
  sale_id: string;
}

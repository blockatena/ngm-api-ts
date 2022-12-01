import { ApiProperty } from '@nestjs/swagger';
export class MakeOfferBody {
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
  contract_address: string;
  @ApiProperty()
  token_id: string;
  @ApiProperty()
  offer_person_address: string;
  @ApiProperty()
  token_owner: string;
}

export class GetAllOffersBody {
  @ApiProperty()
  sale_id: string;
}

export class CancelOffer {
  @ApiProperty()
  contract_address: string;
  @ApiProperty()
  token_id: string;
  @ApiProperty()
  offer_person_address: string;
  @ApiProperty()
  caller: string;
}
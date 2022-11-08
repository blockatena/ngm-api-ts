import { ApiProperty } from '@nestjs/swagger';

export class EmptyCollection {
  @ApiProperty()
  collection_name: string;
}
export class UpdateNft {
  @ApiProperty()
  contract_address: string;
}

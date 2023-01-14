import { ApiProperty } from "@nestjs/swagger";

export class GetNft1155 {
    @ApiProperty()
    contract_address: string;
    @ApiProperty()
    token_id: number;
}
import { ApiProperty } from "@nestjs/swagger";

export class GetBal1155 {
    @ApiProperty()
    contract_address: string;
    @ApiProperty()
    token_id: number;
}
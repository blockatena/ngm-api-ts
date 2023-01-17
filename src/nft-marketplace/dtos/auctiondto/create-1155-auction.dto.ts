import { ApiProperty } from "@nestjs/swagger";

export class G2W3_1155Auction {
    @ApiProperty()
    token_owner: string;
    @ApiProperty()
    contract_address: string;
    @ApiProperty()
    token_id: number;
    @ApiProperty()
    number_of_tokens: number;
    @ApiProperty()
    start_date: Date;
    @ApiProperty()
    end_date: Date;
    @ApiProperty()
    min_price: number;
    // @ApiProperty()
    // sign
}
import { ApiProperty } from "@nestjs/swagger";

class Attributes {
    name: string;
    value: string;
}
export class G2Web3_1155 {
    @ApiProperty({ default: "0xa8E7CCE298F1C2e52DE6920840d80C28Fc787F72" })
    token_owner: string;
    @ApiProperty()
    contract_address: string;
    @ApiProperty({ default: 0 })
    token_id: number;
    @ApiProperty({ default: 10 })
    number_of_tokens: number;
    @ApiProperty()
    name: string
    @ApiProperty()
    image_uri: string;
    @ApiProperty({ default: [{ "name": "energy", "value": 2000 }] })
    attributes: Attributes[];
    @ApiProperty({ default: "Deep Under the Blue Sea There lives a Ocean Gaint" })
    description: string
    @ApiProperty({ default: "www.google.com" })
    external_uri: string
}


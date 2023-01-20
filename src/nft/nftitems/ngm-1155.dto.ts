import { ApiProperty } from "@nestjs/swagger";

class Attributes {
    name: string;
    value: string;
}
export class G2Web3_1155 {
    @ApiProperty({ example: "0xa8E7CCE298F1C2e52DE6920840d80C28Fc787F72", required:false })
    token_owner: string;
    @ApiProperty({example:'0x31b9879FC5853C22487b99Bf97B1Bf48eAeA88d2', required:false})
    contract_address: string;
    @ApiProperty({ example: 0, required:false })
    token_id: number;
    @ApiProperty({ example: 10, required:false })
    number_of_tokens: number;
    @ApiProperty({example:'My NFT', required:false})
    name: string
    @ApiProperty({example:'NT Image Url starts from https', required:false})
    image_uri: string;
    @ApiProperty({ example: [{ "name": "energy", "value": 2000 }] , required:false})
    attributes: Attributes[];
    @ApiProperty({ example: "Deep Under the Blue Sea There lives a Ocean Gaint", required:false })
    description: string
    @ApiProperty({ example: "www.google.com" , required:false})
    external_uri: string
}


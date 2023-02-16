import { ApiProperty } from "@nestjs/swagger"
import { type } from "os";

class Attributes {
    @ApiProperty({ default: "score" })
    name: string;
    @ApiProperty({ default: "200" })
    value: string
}
class MetaData {
    @ApiProperty()
    name: string;
    @ApiProperty({})
    image: string;
    @ApiProperty({})
    description: string;
    @ApiProperty({ default: "" })
    external_uri: string;
    @ApiProperty({ type: Attributes })
    attributes: [];
}


class GetSingleNft {
    @ApiProperty({})
    _id: string;
    @ApiProperty({})
    contract_address: string;
    @ApiProperty({})
    contract_type: string;
    @ApiProperty({})
    token_id: number;
    @ApiProperty({})
    price: string;
    @ApiProperty({})
    meta_data_url: string;
    @ApiProperty({})
    is_in_auction: boolean;
    @ApiProperty({})
    is_in_sale: boolean;
    @ApiProperty({})
    token_owner: string;
    @ApiProperty({})
    meta_data: MetaData
    @ApiProperty({})
    createdAt: string;
    @ApiProperty({})
    updatedAt: string;
    __v: 0
}

export class GetAllNfts {
    @ApiProperty({})
    totalpages: number;
    @ApiProperty({})
    currentPage: number;
    @ApiProperty({ type: GetSingleNft })
    nfts: [];
}
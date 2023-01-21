import { ApiProperty } from "@nestjs/swagger";

export class GetNft1155 {
    @ApiProperty()
    contract_address: string;
    @ApiProperty()
    token_id: number;
}

export class GetTokensUserHold {
    @ApiProperty()
    token_owner: string;
    @ApiProperty()
    contract_address: string;
    @ApiProperty()
    token_id: number;
}

export class get1155nft {
    @ApiProperty()
    contract_address:string
    @ApiProperty()
    token_id:number
    @ApiProperty()
    token_owner:string
}
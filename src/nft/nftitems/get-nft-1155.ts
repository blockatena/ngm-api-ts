import { ApiProperty } from "@nestjs/swagger";

export class GetNft1155 {
    @ApiProperty({ default: "0x68e24E30348cACcB8dF3d62Fa2891B4864ff0879" })
    contract_address: string;
    @ApiProperty({ default: 0 })
    token_id: number;
}

export class GetTokensUserHold {
    @ApiProperty({default:"0x81CcBB87535864eD9F511f5196fc22deEd77a272"})
    token_owner: string;
    @ApiProperty({default:"0x68e24E30348cACcB8dF3d62Fa2891B4864ff0879"})
    contract_address: string;
    @ApiProperty({default:0})
    token_id: number;
}

export class GetAssetByUser {
    @ApiProperty()
    token_owner: string;
    @ApiProperty()
    contract_address: string;
    @ApiProperty()
    token_id: number;
}

export class get1155nft {
    @ApiProperty()
    contract_address: string
    @ApiProperty()
    token_id: number
    @ApiProperty()
    token_owner: string
}
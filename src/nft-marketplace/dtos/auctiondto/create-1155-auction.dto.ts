import { ApiProperty } from "@nestjs/swagger";

export class G2W3_1155Sale {
    @ApiProperty({default:"0xa8E7CCE298F1C2e52DE6920840d80C28Fc787F72"})
    token_owner: string;
    @ApiProperty({default:"0x68e24E30348cACcB8dF3d62Fa2891B4864ff0879"})
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
    per_unit_price: number;
    @ApiProperty()
    sign:string;
}

export class G2W3_1155CancelSale {
    @ApiProperty({default:"0xa8E7CCE298F1C2e52DE6920840d80C28Fc787F72"})
    token_owner: string;
    @ApiProperty({default:"0x68e24E30348cACcB8dF3d62Fa2891B4864ff0879"})
    contract_address: string;
    @ApiProperty()
    token_id: number;
    @ApiProperty()
    sign:string
}
export class G2W3_1155Offer {
    @ApiProperty({default:"0x81CcBB87535864eD9F511f5196fc22deEd77a272"})
    offer_person_address: string;
    @ApiProperty({default:"0x68e24E30348cACcB8dF3d62Fa2891B4864ff0879"})
    contract_address: string;
    @ApiProperty()
    token_id: number;
    @ApiProperty()
    number_of_tokens: number;
    @ApiProperty()
    per_unit_price: number;
    @ApiProperty()
    sign:string;
    // @ApiProperty()
    // start_date: Date;
    // @ApiProperty()
    // end_date: Date;
    // @ApiProperty()
    // sign
}

export class G2W3_1155AcceptOffer {
    @ApiProperty({default:"0x81CcBB87535864eD9F511f5196fc22deEd77a272"})
    offer_person_address: string;
    @ApiProperty()
    token_owner:string;
    @ApiProperty({default:"0x68e24E30348cACcB8dF3d62Fa2891B4864ff0879"})
    contract_address: string;
    @ApiProperty()
    token_id: number;
    @ApiProperty()
    number_of_tokens: number;
    @ApiProperty()
    sign:string;
    // @ApiProperty()
    // per_unit_price: number;
}
export class G2W3_1155CancelOffer {
    @ApiProperty({default:"0x81CcBB87535864eD9F511f5196fc22deEd77a272"})
    offer_person_address: string;
    @ApiProperty({default:"0x68e24E30348cACcB8dF3d62Fa2891B4864ff0879"})
    contract_address: string;
    @ApiProperty()
    token_id: number;
    @ApiProperty()
    sign:string;
}


export class G2W3_1155AllOffers {
    @ApiProperty({default:"0x68e24E30348cACcB8dF3d62Fa2891B4864ff0879"})
    contract_address: string;
    @ApiProperty()
    token_id: number;
}
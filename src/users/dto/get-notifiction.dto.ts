import { ApiProperty } from "@nestjs/swagger";

export class GetNotification {
    @ApiProperty({default:'0xa8E7CCE298F1C2e52DE6920840d80C28Fc787F72'})
    wallet_address: string;
    @ApiProperty({default:1, minimum:1})
    page_number: number;
    @ApiProperty({default:5})
    items_per_page: number;
}

class items {
    @ApiProperty({})
    name: string
    @ApiProperty({})
    contract_address: string
    @ApiProperty({})
    token_id: string
    @ApiProperty({})
    image: string
}

export class notifications {
    @ApiProperty({})
    _id: string
    @ApiProperty({})
    event: string
    @ApiProperty({})
    item: items
    @ApiProperty({})
    price: string
    @ApiProperty({})
    quantity: string
    @ApiProperty({})
    transaction_hash: string
    @ApiProperty({})
    from: string
    @ApiProperty({})
    to: string
    @ApiProperty({})
    read: string
    @ApiProperty({})
    createdAt: string
    @ApiProperty({})
    updatedAt: string
}
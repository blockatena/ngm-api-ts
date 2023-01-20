import { ApiProperty } from "@nestjs/swagger";
export class GetCollectionBody {
    @ApiProperty({ default: 1 , minimum: 1 })
    page_number: number;
    @ApiProperty({ default: 5 })
    items_per_page: number;
}
export class GetUserOwnedCollections {
    @ApiProperty({ default: '0xa8E7CCE298F1C2e52DE6920840d80C28Fc787F72' })
    owner_address: string;
    @ApiProperty({ default: 1, minimum: 1 })
    page_number: number;
    @ApiProperty({ default: 5 })
    items_per_page: number;
}
import { ApiProperty } from "@nestjs/swagger";
export class GetCollectionBody {
    @ApiProperty({ default: 1 })
    page_number: number;
    @ApiProperty({ default: 5 })
    items_per_page: number;
}
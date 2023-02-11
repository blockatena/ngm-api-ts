import { ApiProperty } from "@nestjs/swagger";

export class UserActivity {
    @ApiProperty({ example: '0x2A8b77DF421106C8fCdBE08697c949D519f4c05a' })
    wallet_address: string;
    @ApiProperty({ example: 2 })
    page_number: number;
    @ApiProperty({ example: 5 })
    items_per_page: number;
}
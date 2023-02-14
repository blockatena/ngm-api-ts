import { ApiProperty } from "@nestjs/swagger";
import { APIGuard } from "src/guards/roles.guard";
export class GetCollectionBody {
    @ApiProperty({ default: 1 })
    page_number: number;
    @ApiProperty({ default: 12 })
    items_per_page: number;
    @ApiProperty({ enum: ["NA", "NEWTOOLD", "OLDTONEW", "ATOZ", "ZTOA"], default: "NA" })
    sort_by:string;
}
export class GetUserOwnedAssets {
    @ApiProperty({ default: '0xa8E7CCE298F1C2e52DE6920840d80C28Fc787F72' })
    owner_address: string;
    @ApiProperty({ default: 1, minimum: 1 })
    page_number: number;
    @ApiProperty({ default: 5 })
    items_per_page: number;
}
export class GetAssets {
    @ApiProperty({ default: "0x68e24E30348cACcB8dF3d62Fa2891B4864ff0879" })
    contract_address?: string;
    @ApiProperty()
    listed_in?: string;
    @ApiProperty({ default: 1 })
    page_number?: number;
    @ApiProperty({ default: 10 })
    items_per_page?: number;
    @ApiProperty({ enum: ['OldToNew', 'NewToOld'], default: 'NewToOld' })
    order?: string;
    @ApiProperty({ enum: ['AtoZ', 'ZtoA'], default: 'AtoZ' })
    alphabetical_order?: string;
}
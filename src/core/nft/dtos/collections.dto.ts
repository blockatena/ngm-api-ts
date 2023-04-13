import { ApiProperty } from '@nestjs/swagger';
import { APIGuard } from 'src/services/roles.guard';
export class GetCollectionBody {
  @ApiProperty({ default: 1 })
  page_number: number;
  @ApiProperty({ default: 12 })
  items_per_page: number;
  @ApiProperty({
    enum: ['NA', 'NEWTOOLD', 'OLDTONEW', 'ATOZ', 'ZTOA'],
    default: 'NA',
  })
  sort_by: string;
  @ApiProperty({
    enum: [
      'NA',
      'ETHEREUM',
      'POLYGON',
      'FILECOIN',
      'MUMBAI',
      'GOERLI',
      'HYPERSPACE',
    ],
    default: 'NA',
  })
  chain: string;
  @ApiProperty({ enum: ['NA', 'ERC721', 'ERC1155'], default: 'NA' })
  type: string;
}
export class GetUserOwnedAssets {
  @ApiProperty({ default: '0xa8E7CCE298F1C2e52DE6920840d80C28Fc787F72' })
  owner_address: string;
  @ApiProperty({ default: 1, minimum: 1 })
  page_number: number;
  @ApiProperty({ default: 5 })
  items_per_page: number;
}

export class GetUserOwnedAssetsByCollections {
  @ApiProperty({ default: '0xa8E7CCE298F1C2e52DE6920840d80C28Fc787F72' })
  owner_address: string;
  @ApiProperty({ default: "0xC5dc32D501dc8743E7375FA17B12B34E4C0994de" })
  contract_address: string;
}

export class GetAssets {
  @ApiProperty({ default: '0x68e24E30348cACcB8dF3d62Fa2891B4864ff0879' })
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

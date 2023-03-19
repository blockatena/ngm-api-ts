import { ApiProperty } from '@nestjs/swagger';

export class GetBal1155 {
  @ApiProperty({ default: '0x68e24E30348cACcB8dF3d62Fa2891B4864ff0879' })
  contract_address: string;
  @ApiProperty({ default: 0 })
  token_id: number;
  @ApiProperty({ default: '0xa8E7CCE298F1C2e52DE6920840d80C28Fc787F72' })
  owner_address: string;
}

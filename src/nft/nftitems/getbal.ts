import { ApiProperty } from "@nestjs/swagger";

export class GetBal1155 {
    @ApiProperty({default:'0x68e24E30348cACcB8dF3d62Fa2891B4864ff0879'})
    contract_address: string;
    @ApiProperty({default:0})
    token_id: number;
}
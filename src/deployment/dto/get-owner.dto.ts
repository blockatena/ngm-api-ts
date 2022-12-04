import { ApiProperty } from "@nestjs/swagger";

export class GetOwner {
    @ApiProperty()
    contract_address: string;
    @ApiProperty()
    token_id: string;
}
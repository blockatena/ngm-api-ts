import { ApiProperty } from "@nestjs/swagger";

export class GetOwner {
    @ApiProperty()
    readonly contract_address: string;
    @ApiProperty()
    readonly token_id: string;
}
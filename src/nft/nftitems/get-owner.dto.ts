import { ApiProperty } from "@nestjs/swagger";

export class GetOwner {
    @ApiProperty({default: '0x31b9879FC5853C22487b99Bf97B1Bf48eAeA88d2'})
    readonly contract_address: string;
    @ApiProperty({default:'1'})
    readonly token_id: string;
}

export class getOwnerRes {
    @ApiProperty({})
    owner_address:string
}
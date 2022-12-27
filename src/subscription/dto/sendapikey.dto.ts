import { ApiProperty } from "@nestjs/swagger";

export class SendAPiKey {
    @ApiProperty()
    wallet_address: string;
}
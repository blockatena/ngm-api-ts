import { ApiProperty } from "@nestjs/swagger";

export class UserBody {
    @ApiProperty()
    wallet_address: string;
    @ApiProperty()
    email: string;
}
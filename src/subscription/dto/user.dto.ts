import { ApiProperty } from "@nestjs/swagger";

export class UserBody {
    @ApiProperty({default:'0xa8E7CCE298F1C2e52DE6920840d80C28Fc787F72'})
    wallet_address: string;
    @ApiProperty({default:'user email id'})
    email: string;
}
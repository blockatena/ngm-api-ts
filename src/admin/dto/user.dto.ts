import { ApiProperty } from "@nestjs/swagger";

class Limit {
    @ApiProperty()
    collections_limit: number;
    @ApiProperty()
    asset_limit: number;
}

export class User {
    @ApiProperty()
    wallet_address: string;
    @ApiProperty()
    email: string;
}


export class UserBody {
    @ApiProperty()
    wallet_address: string;
    @ApiProperty()
    email: string;
    @ApiProperty({
        default: {
            collections_limit: 1,
            asset_limit: 10
        }
    })
    increse_limit: Limit
}
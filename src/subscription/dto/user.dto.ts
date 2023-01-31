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
    @ApiProperty({default:'0xa8E7CCE298F1C2e52DE6920840d80C28Fc787F72'})
    wallet_address: string;
    @ApiProperty({default:'user email id'})
    email: string;
    @ApiProperty({
        default: {
            collections_limit: 1,
            asset_limit: 10
        }
    })
    increse_limit: Limit
}
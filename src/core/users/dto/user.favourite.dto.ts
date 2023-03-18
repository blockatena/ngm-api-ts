import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { UserFavouriteEnum, FavouriteKindEnum, NftTypeEnum } from "../enum/user.favourite.enum";

export class UserFavouriteDto {
    @ApiProperty()
    contract_address: string;
    @ApiPropertyOptional()
    token_id?: number;
    @ApiPropertyOptional({ enum: NftTypeEnum })
    nft_type?: NftTypeEnum;
    @ApiProperty({ enum: FavouriteKindEnum, default: FavouriteKindEnum.COLLECTIONS })
    favourite_kind: FavouriteKindEnum;
    @ApiProperty()
    wallet_address: string;
    @ApiProperty({ enum: UserFavouriteEnum, default: UserFavouriteEnum.ADD })
    action: UserFavouriteEnum;
}

export class IsUserFavourite {
    @ApiProperty()
    contract_address: string;
    @ApiPropertyOptional()
    token_id?: number;
    @ApiPropertyOptional({ enum: NftTypeEnum })
    nft_type?: NftTypeEnum;
    @ApiProperty({ enum: FavouriteKindEnum, default: FavouriteKindEnum.COLLECTIONS })
    favourite_kind: FavouriteKindEnum;
    @ApiProperty()
    wallet_address: string;

}

export class GetUserFavourite {
    @ApiProperty({ enum: FavouriteKindEnum, default: FavouriteKindEnum.COLLECTIONS })
    favourite_kind: FavouriteKindEnum;
    @ApiProperty()
    wallet_address: string;
    @ApiProperty({enum:['NGM721','NGM1155','NA'], default:'NA'})
    nftType: string;
}
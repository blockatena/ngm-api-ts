import {
  NftTypeEnum,
  UserFavouriteEnum,
} from 'src/core/users/enum/user.favourite.enum';

export class NftHandleLikes {
  contract_address: string;
  token_id: number;
  action: UserFavouriteEnum;
  nft_type: NftTypeEnum;
}

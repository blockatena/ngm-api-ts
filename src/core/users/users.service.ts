import { Injectable } from '@nestjs/common';
import { CreateUserDto, GetUser } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
// import { JwtAuthService } from 'src/jwt-auth/jwt-auth.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FixedNumber } from 'ethers';
import { UserDocument, UserSchema } from './schema/user.schema';
import { GetUserFavourite, IsUserFavourite, UserFavouriteDto } from './dto/user.favourite.dto';
import { FavouriteKindEnum, NftTypeEnum, UserFavouriteEnum } from './enum/user.favourite.enum';
import { NftService } from '../nft/nft.service';
const { log } = console;
@Injectable()
export class UsersService {
  constructor(
    private nftservice: NftService,
    @InjectModel(UserSchema.name) private UserModel: Model<UserDocument>,
    // private JWTservice: JwtAuthService,
  ) {
    UserModel;
  }
  /***************[CREATING_USER]**************/
  async create(createUserDto: CreateUserDto): Promise<any> {
    // createUserDto.jwt = await this.JWTservice.Sign(createUserDto);
    const { wallet_address, email, username } = createUserDto;
    try {
      console.log(createUserDto);

      const is_email_exists_already = await this.UserModel.findOne({ email });
      if (is_email_exists_already) {
        return `${email} is already Linked to another Wallet Please try another Email `
      }
      // const is_username_exists_already = await this.UserModel.findOne({ username });
      // if (is_username_exists_already) {
      //   return `The Username  ${username} already exists Please try another Username`;
      // }
      let isUser = await this.isUserExist(wallet_address)
      if(isUser) {
        return await this.UserModel.findOneAndUpdate({wallet_address},{
        ...createUserDto, limit: { collections: 5, assets: 50 }
      });
      }
      return await this.UserModel.create({
        ...createUserDto, limit: { collections: 5, assets: 50 }
      });
    }
    catch (error) {
      console.log(error);
      return {
        mesage: "Something went Wrong"
      }
    }
  }

  findAll() {
    return `This action returns all users`;
  }
  // To get User
  async getUser(getUser: GetUser): Promise<any> {
    const { wallet_address } = getUser;
    try {
      return await this.UserModel.findOne({ wallet_address });
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: 'something went wrong',
        error
      }
    }

  }
  // Update User
  async updateUser(wallet_address: string, update_data: any) {

    try {
      return await this.UserModel.updateOne({ wallet_address }, {
        $set: {
          ...update_data
        }
      })
      // return `This action updates a #${id} user`;
    } catch (error) {
      log(error);
    }
  }

  /**********[Increse Limit]***********/
  async increseLimit(wallet_address: string, collection: number, assets: number): Promise<any> {
    try {
      return await this.UserModel.updateOne({ wallet_address }, { $inc: { "limit.collection": collection, "limit.assets": assets } });
    } catch (error) {
      log(error)
      return {
        success: false,
        message: 'Something Went Wrong',
        error
      }
    }
  }
  // Remove User
  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async userFavourite(body: UserFavouriteDto): Promise<any> {
    const { wallet_address, action, favourite_kind, contract_address, token_id } = body;
    try {
      console.log(body)
      console.log({ favourite_kind });
      let isUser =await this.isUserExist(wallet_address)
      console.log('isUser', isUser)
      switch (favourite_kind) {
        case FavouriteKindEnum.COLLECTIONS:
          if(!isUser) await this.UserModel.create({wallet_address})
          return await this.UserModel.findOneAndUpdate({ wallet_address }, {
            [action === UserFavouriteEnum.ADD ? '$push' : '$pull']: {
              "favourites.collections": contract_address
            }
          }, { new: true });
        case FavouriteKindEnum.NFTS:
          if(!isUser) await this.UserModel.create({wallet_address})
          return await this.addOrRemoveUserFavouriteNfts(body);
        default:
          return "INVALID FAVOURITE WE ONLY SUPPORT COLLECTION AND NFT";

      }
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: 'Something went Wrong',
        error
      }
    }
  }

  async addOrRemoveUserFavouriteNfts(body: UserFavouriteDto) {
    const { wallet_address, action, favourite_kind, contract_address, token_id, nft_type } = body;
    try {

      if (nft_type === NftTypeEnum.NGM721) {
        return await this.UserModel.findOneAndUpdate({ wallet_address }, {
          [action === UserFavouriteEnum.ADD ? '$push' : '$pull']: {
            "favourites.nfts.ngm721": {
              contract_address, token_id
            }
          }
        }, { new: true });
      }
      if (nft_type === NftTypeEnum.NGM1155) {
        return await this.UserModel.findOneAndUpdate({ wallet_address }, {
          [action === UserFavouriteEnum.ADD ? '$push' : '$pull']: {
            "favourites.nfts.ngm1155": {
              contract_address, token_id
            }
          }
        }, { new: true });
      }

    } catch (error) {
      console.log(error)
      return {
        success: false,
        message: 'something went wrong',
        error
      }
    }
  }


  async getUserFavouriteNfts(body: GetUserFavourite) {
    const { wallet_address } = body;

    try {

      const nft721Pipeline = await this.UserModel.aggregate(
        [
          {
            $match: { wallet_address }
          },
          {
            $unwind: "$favourites.nfts.ngm721"
          },
          {
            $lookup: {
              from: "nftschemas",
              let: { contract_address: "$favourites.nfts.ngm721.contract_address", token_id: "$favourites.nfts.ngm721.token_id" },
              pipeline: [
                {
                  $match: { $expr: { $and: [{ $eq: ["$contract_address", "$$contract_address"] }, { $eq: ["$token_id", "$$token_id"] }] } }
                }
              ],
              as: "fav_721"
            }
          }, {
            $project: {
              fav_721: 1
            }
          }]
      )

      const nft1155Pipeline = await this.UserModel.aggregate(
        [
          {
            $match: { wallet_address }
          },
          {
            $unwind: "$favourites.nfts.ngm1155"
          },
          {
            $lookup: {
              from: "nft1155schemas",
              let: { contract_address: "$favourites.nfts.ngm1155.contract_address", token_id: "$favourites.nfts.ngm1155.token_id" },
              pipeline: [
                {
                  $match: { $expr: { $and: [{ $eq: ["$contract_address", "$$contract_address"] }, { $eq: ["$token_id", "$$token_id"] }] } }
                }
              ],
              as: "fav_1155"
            }
          }, {
            $project: {
              fav_1155: 1
            }
          }]
      )
      const favourite_721_assets = nft721Pipeline[0].fav_721;
      const fav_1155_assets = nft1155Pipeline[0].fav_1155;
      console.log(favourite_721_assets);
      return { favourite_721_assets, fav_1155_assets };
    } catch (error) {
      log(error)
      return {
        success: false,
        messsage: 'something went wrong',
        error
      }
    }
  }

  async checkIsUserFavourite(body: IsUserFavourite): Promise<any> {
    const {
      contract_address,
      token_id,
      nft_type,
      favourite_kind,
      wallet_address } = body;
    try {
      console.log(body);
      const isUser = await this.isUserExist(wallet_address)
      if(!isUser) return {error:'INVALID USER'}
      switch (favourite_kind) {
        case FavouriteKindEnum.COLLECTIONS:
          return await this.UserModel.findOne({ wallet_address, "favourites.collections": { $in: [contract_address] } });
        case FavouriteKindEnum.NFTS:
          switch (nft_type) {
            case NftTypeEnum.NGM721:
              console.log("hit");
              return await this.UserModel.findOne({ wallet_address, "favourites.nfts.ngm721": { $in: [{ contract_address, token_id }] } });
            case NftTypeEnum.NGM1155:
              return await this.UserModel.findOne({ wallet_address, "favourites.nfts.ngm1155": { $in: { contract_address, token_id } } });
            default:
              return {error:"INVALID NFT TYPE WE ALLOW NGM1155 or NGM721"};
          }

        default:
          return {error:"INVALID TYPE WE ALLOW COLLECTIONS AND NFTS"};
      }
    }
    catch (error) {
      console.log(error);
      return {
        success: false,
        messsage: 'something went wrong',
        error
      }

    }
  }

  async isUserExist(wallet_address:string): Promise<any>  {
    let ifUser = await this.UserModel.findOne({wallet_address})
      if(!ifUser) return false;
      return true;
  }
  //Get User Favourite Collections

  async getUserFavouriteCollections(body: GetUserFavourite) {
    const { wallet_address } = body;

    try {
      return await this.UserModel.aggregate(
        [
          {
            $match: { wallet_address }
          },
          {
            $unwind: "$favourites.collections"
          },
          {
            $lookup: {
              from: "contractschemas",
              let: { contract_address: "$favourites.contract_address" },
              pipeline: [
                {
                  $match: { $expr: { $and: [{ $eq: ["$contract_address", "$$contract_address"] }] } }
                }
              ],
              as: "collections"
            }
          },]
      )
    } catch (error) {
      log(error)
      return {
        success: false,
        messsage: 'something went wrong',
        error
      }
    }
  }

  async getAllFavouriteCollections(body:GetUserFavourite) {
    const {wallet_address} = body;

    try {
      const user = await this.UserModel.findOne({wallet_address})
      const collections = await this.nftservice.getCollectionsSelected(user?.favourites?.collections)
      
      return {
        success:true,
        message:'GET ALL FAVOURITE COLLECTIONS',
        data:collections?.collections
      }
    } catch (error) {
      return {
        success:false,
        message:'something went wrong',
        error
      }
    }
  }


  async getAllFavouriteNFTs(body:GetUserFavourite) {
    const {wallet_address, nftType} = body;

    try {
      const user = await this.UserModel.findOne({wallet_address})
      if(nftType == 'NGM721') {
        const nfts721 = await this.nftservice.get721NFTsSelected(user?.favourites.nfts.ngm721);
        return {
        success:true,
        message:'GET ALL NGM721 FAVOURITE NFTS',
        data: nfts721
      }
      } 
      if(nftType == 'NGM1155') {
        const nfts1155 = await this.nftservice.get1155NFTsSelected(user?.favourites?.nfts?.ngm1155);
        return {
        success:true,
        message:'GET ALL NGM1155 FAVOURITE NFTS',
        data: nfts1155
      }
      }
      return {
        success:false,
        message:'Please select NFT Type',
      }
    } catch (error) {
      return {
        success:false,
        message:'something went wrong',
        error
      }
    }
  }



  // async testFix(): Promise<any> {
  //   return this.UserModel.updateMany({}, { $set: { limit: { collection: 0, assets: 0 }, } });
  // }

}


/* 
{
  success:true,
  message:"Successfully Fetched The NFTs",
  data:nftData
}

{
  success:false,
  message:"NFT Not Found"
}

{
  success:false,
  message:"Unable to fetch data",
  error
}

*/
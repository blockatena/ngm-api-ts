import { Injectable } from '@nestjs/common';
import { CreateUserDto, GetUser } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
// import { JwtAuthService } from 'src/jwt-auth/jwt-auth.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FixedNumber } from 'ethers';
import { UserDocument, UserSchema } from './schema/user.schema';
const { log } = console;
@Injectable()
export class UsersService {
  constructor(
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

  // async testFix(): Promise<any> {
  //   return this.UserModel.updateMany({}, { $set: { limit: { collection: 0, assets: 0 }, } });
  // }
}

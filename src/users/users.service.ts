import { Injectable } from '@nestjs/common';
import { CreateUserDto, GetUser } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthService } from 'src/jwt-auth/jwt-auth.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument, UserSchema } from 'src/schemas/user.schema';
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserSchema.name) private UserModel: Model<UserDocument>,
    private JWTservice: JwtAuthService,
  ) {
    UserModel;
  }

  async create(createUserDto: CreateUserDto): Promise<any> {
    // createUserDto.jwt = await this.JWTservice.Sign(createUserDto);
    const { wallet_address, email, username } = createUserDto;
    try {
      console.log(createUserDto);

      const is_email_exists_already = await this.UserModel.findOne({ email });
      if (is_email_exists_already) {
        return `${email} is already Linked to another Wallet Please try another Email `
      }
      const is_username_exists_already = await this.UserModel.findOne({ username });
      if (is_username_exists_already) {
        return `The Username  ${username} already exists Please try another Username`;
      }
      return await this.UserModel.create(createUserDto);
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

  async getUser(wallet_address: string): Promise<any> {
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

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}

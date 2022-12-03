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
    console.log(createUserDto);
    return await this.UserModel.create(createUserDto);
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

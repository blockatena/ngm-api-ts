import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
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

  async create(createUserDto: CreateUserDto) {
    createUserDto.jwt = await this.JWTservice.Sign(createUserDto);
    console.log(createUserDto);
    return await (await this.UserModel.create(createUserDto)).save();
  }

  findAll() {
    return `This action returns all users`;
  }

  async findOne(id: String) {
    return await this.UserModel.findOne({ _id: id });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}

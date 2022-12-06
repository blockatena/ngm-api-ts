import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, GetUser } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { Wallet } from 'ethers';
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }
  @ApiOperation({ summary: 'This Api will create a User' })
  @Post('create-user')
  async create(@Body() createUserDto: CreateUserDto) {
    const { wallet_address } = createUserDto;
    try {
      // check wallet Address is present in Db
      const is_user_exists = await this.usersService.getUser(wallet_address);
      console.log(is_user_exists);
      if (is_user_exists) {
        return 'user already exists';
      }
      return await this.usersService.create(createUserDto);
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: "Something went Wrong"
      }
    }
  }

  @Get()
  async findAll() {
    return await this.usersService.findAll();
  }

  @Get('/get-user/:wallet_address')
  async findOne(@Param('wallet_address') wallet_address: string): Promise<any> {
    try {
      //  name banner image profile image wallet address email
      const data = await this.usersService.getUser(wallet_address);
      console.log(data);
      return data || 'you are not registered with us';
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: 'something Went wrong',
        error
      }
    }

  }
  // [profle pic,name, banner, name, update 
  //email]
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}

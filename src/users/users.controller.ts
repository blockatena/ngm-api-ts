import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { NFTStorage, File, Blob } from 'nft.storage';
import { UsersService } from './users.service';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto, GetUser, UpdateUser, UserPic } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBody, ApiConsumes, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { NftService } from 'src/nft/nft.service';
import { ActivityService } from 'src/activity/activity.service';
import { GetNotification } from './dto/get-notifiction.dto';
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService, private configService: ConfigService,
    private readonly nftService: NftService,
    private readonly activityService: ActivityService
  ) {
  }
  // 
  private NFT_STORAGE_KEY = this.configService.get<string>('NFT_STORAGE_KEY');
  private token = this.NFT_STORAGE_KEY;
  private storage = new NFTStorage({ token: this.token });
  // 
  @ApiOperation({ summary: 'This Api will create a User' })
  @Post('create-user')
  async create(@Body() createUserDto: CreateUserDto) {
    const { wallet_address, username, email } = createUserDto;
    try {
      // check wallet Address is present in Db
      const is_user_exists = await this.usersService.getUser(wallet_address);
      console.log(is_user_exists);

      if (is_user_exists) {
        return `${wallet_address} exists already`;
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
      // const data1 = user_details.email || user_details.username || user_details.wallet_address;
      // console.log(data1);

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

  @ApiOperation({ summary: 'This Api will updates username' })
  @Patch('update-user')
  async updateUser(@Body() updateUser: UpdateUser): Promise<any> {
    const { wallet_address, username } = updateUser;
    try {
      // First find user exists or not
      const is_user_exists = await this.usersService.getUser(wallet_address);
      if (!is_user_exists) {
        return `${wallet_address} doesnt register with us please register`;
      }
      return await this.usersService.updateUser(wallet_address, { username });
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: 'Something went wrong',
        error
      }
    }
  }
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
  // File Upload
  @ApiOperation({
    summary: 'This Api will upload your profile pic or banner gets you URI of that Profile pic or banner',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        wallet_address: { type: 'string' },
        type: { type: 'string' }
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file'),
  )
  @Post('uploadFile')
  async uploadFile(@Body() body: UserPic,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 200000 }),// 1kb=1000
          new FileTypeValidator({ fileType: 'jpeg' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const { wallet_address, type } = body;
    try {
      //check user is registered or not 
      const is_user_exists = await this.usersService.getUser(wallet_address);
      if (!is_user_exists) {
        return 'User doesnt exists Please Register with us';
      }
      console.log(file, body);
      const blob = new Blob([file.buffer]);
      const toUploadFile = new File([blob], `/${file.originalname}`, {
        type: file.mimetype,
      });
      const cid = await this.storage.storeDirectory([toUploadFile]);
      const tokenUri = `https://nftstorage.link/ipfs/${cid}/${file.originalname}`;
      console.log({ tokenUri });
      // // **********Storing in Db
      if (type == 'profile')
        await this.usersService.updateUser(wallet_address, { profile_image: tokenUri })
      if (type == 'banner')
        await this.usersService.updateUser(wallet_address, { banner_image: tokenUri })
      // **********
      return await this.usersService.getUser(wallet_address);
    } catch (error) {
      return {
        success: false,
        message: 'something went Wrong'
      };
    }
  }
  // 
  @Get('get-user-notification/:wallet_address/:page_number/:items_per_page/')
  async getUserNotification(@Param() getNotification: GetNotification): Promise<any> {
    const { log } = console;
    try {
      return await this.activityService.getUserNotifications(getNotification);
    } catch (error) {
      log(error);
      return {

        error,
      }
    }
  }
}

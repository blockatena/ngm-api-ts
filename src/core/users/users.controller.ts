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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { NFTStorage, File, Blob } from 'nft.storage';
import { UsersService } from './users.service';
import { ConfigService } from '@nestjs/config';
import {
  CreateUserDto,
  GetUser,
  UpdateUser,
  UserPic,
} from './dto/create-user.dto';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ActivityService } from 'src/activity/activity.service';
import { GetNotification } from './dto/get-notifiction.dto';
import { EmailService } from 'src/services/email.service';
import { NftService } from 'src/core/nft/nft.service';
import {
  GetUserFavourite,
  IsUserFavourite,
  UserFavouriteDto,
} from './dto/user.favourite.dto';
import { FavouriteKindEnum } from './enum/user.favourite.enum';
@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private configService: ConfigService,
    private readonly nftService: NftService,
    private readonly activityService: ActivityService,
    private readonly emailService: EmailService,
  ) {}
  //
  private NFT_STORAGE_KEY = this.configService.get<string>('NFT_STORAGE_KEY');
  private token = this.NFT_STORAGE_KEY;
  private storage = new NFTStorage({ token: this.token });

  @ApiOperation({ summary: 'Check is User exist' })
  @Get('/isuser_registered/:wallet_address')
  async isUserRegistered(@Param('wallet_address') wallet_address: string) {
    try {
      return await this.usersService.isUserExist(wallet_address);
    } catch (error) {
      return {
        success: false,
        message: 'Unable to Check IsUserExists or not',
        error,
      };
    }
  }
  //
  @ApiOperation({ summary: 'This Api will create a User' })
  @Post('create-user')
  async create(@Body() createUserDto: CreateUserDto) {
    const { wallet_address, username, email } = createUserDto;
    try {
      // check wallet Address is present in Db
      const is_user_exists = await this.usersService.getUser({
        wallet_address,
      });
      console.log(is_user_exists);

      if (is_user_exists?.email) {
        return `${wallet_address} exists already`;
      }
      const success = await this.usersService.create(createUserDto);
      // email
      const mail = await this.emailService.welcomeMail({
        recepient: {
          email_addr: email,
          user_name: username,
          wallet_address: wallet_address,
        },
        subject: 'Welcome',
        message: 'Thank you',
      });
      console.log(mail);
      return success;
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: 'Something went Wrong',
      };
    }
  }

  @Post('handle-favourite')
  async addFavourite(@Body() body: UserFavouriteDto): Promise<any> {
    console.log(body);
    try {
      return await this.usersService.userFavourite(body);
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: 'Something went Wrong',
        error,
      };
    }
  }

  @Post('is_user_favourite')
  async isUserFavourite(@Body() body: IsUserFavourite): Promise<any> {
    try {
      console.log(body);
      const result = await this.usersService.checkIsUserFavourite(body);
      console.log({ result });
      if (result && !result.error) {
        return { isFavourite: true };
      } else {
        return { isFavourite: false };
      }
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: 'Something went Wrong',
        error,
      };
    }
  }

  @Get('favourites/:favourite_kind/:wallet_address/:nftType')
  async getUserFavourites(@Param() body: GetUserFavourite) {
    console.log(body);
    const { wallet_address, favourite_kind, nftType } = body;
    try {
      switch (favourite_kind) {
        case FavouriteKindEnum.COLLECTIONS:
          return await this.usersService.getUserFavouriteCollections(body);
        // return await this.usersService.getAllFavouriteCollections(body);
        case FavouriteKindEnum.NFTS:
          return await this.usersService.getUserFavouriteNfts(body);
        // return await this.usersService.getAllFavouriteNFTs(body);
        default:
          return {
            success: false,
            message: 'INVALID FAVOURITE SELECTION',
          };
      }
    } catch (error) {
      console.log(error);
    }
  }

  @Get()
  async findAll() {
    return await this.usersService.findAll();
  }
  @ApiOperation({ summary: 'Get registered user details' })
  @Get('/get-user/:wallet_address')
  async findOne(@Param() getUser: GetUser): Promise<any> {
    const { wallet_address } = getUser;
    try {
      console.log(wallet_address);
      const data = await this.usersService.getUser({ wallet_address });
      if (!data) {
        return {
          message: 'You are registered with us',
          success: false,
        };
      }
      console.log(data);
      const {
        username,
        email,
        createdAt,
        updatedAt,
        limit,
        profile_image,
        banner_image,
      } = data;
      return {
        username,
        wallet_address,
        email,
        createdAt,
        updatedAt,
        limit,
        profile_image,
        banner_image,
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: 'something Went wrong',
        error,
      };
    }
  }

  @ApiOperation({ summary: 'This Api will updates username' })
  @Patch('update-user')
  async updateUser(@Body() updateUser: UpdateUser): Promise<any> {
    const { wallet_address, username } = updateUser;
    try {
      // First find user exists or not
      const is_user_exists = await this.usersService.getUser({
        wallet_address,
      });
      if (!is_user_exists) {
        return `${wallet_address} doesnt register with us please register`;
      }
      return await this.usersService.updateUser(wallet_address, { username });
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: 'Something went wrong',
        error,
      };
    }
  }
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
  // File Upload
  @ApiOperation({
    summary:
      'This Api will upload your profile pic or banner gets you URI of that Profile pic or banner',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        wallet_address: { type: 'string' },
        type: { type: 'string' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  @Post('uploadFile')
  async uploadFile(
    @Body() body: UserPic,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 200000 }), // 1kb=1000
          new FileTypeValidator({ fileType: 'jpeg' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const { wallet_address, type } = body;
    try {
      //check user is registered or not
      const is_user_exists = await this.usersService.getUser({
        wallet_address,
      });
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
        await this.usersService.updateUser(wallet_address, {
          profile_image: tokenUri,
        });
      if (type == 'banner')
        await this.usersService.updateUser(wallet_address, {
          banner_image: tokenUri,
        });
      // **********
      return await this.usersService.getUser({ wallet_address });
    } catch (error) {
      return {
        success: false,
        message: 'something went Wrong',
      };
    }
  }
  //
  @Get('get-user-notification/:wallet_address/:page_number/:items_per_page/')
  async getUserNotification(
    @Param() getNotification: GetNotification,
  ): Promise<any> {
    const { log } = console;
    try {
      return await this.activityService.getUserNotifications(getNotification);
    } catch (error) {
      log(error);
      return {
        error,
      };
    }
  }

  // @Put('test-fix')
  // async testFix(): Promise<any> {
  //   try {
  //     return await this.usersService.testFix();
  //   } catch (error) {

  //   }
  // }
}

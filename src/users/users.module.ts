import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
// import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
// import { JwtAuthService } from 'src/jwt-auth/jwt-auth.service';
import { NftModule } from 'src/nft/nft.module';
import { ActivityService } from 'src/activity/activity.service';
import { ActivityModule } from 'src/activity/activity.module';
import { EmailModule } from 'src/email/email.module';
import { UserSchema, userSchema } from './schema/user.schema';

@Module({
  imports: [EmailModule, forwardRef(() => NftModule),
    forwardRef(() => ActivityModule),
    // JwtModule.register({
    //   secret: process.env.jwtSecret,
    //   signOptions: { expiresIn: process.env.ExpiresIN },
    // }),
    MongooseModule.forFeature([{ name: UserSchema.name, schema: userSchema }]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule { }

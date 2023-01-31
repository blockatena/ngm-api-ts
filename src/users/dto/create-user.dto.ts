import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({default:'your_username'})
  username: string;
  @ApiProperty({default:'user_email_id'})
  email: string;
  @ApiProperty({default:'0xa8E7CCE298F1C2e52DE6920840d80C28Fc787F72'})
  wallet_address: string;
}

export class UserPic {
  @ApiProperty({default:'0xa8E7CCE298F1C2e52DE6920840d80C28Fc787F72'})
  wallet_address: string;
  @ApiProperty({ enum: ['profile', 'banner'] })
  type: string;
}


export class GetUser {
  @ApiProperty({ default: "0x2A8b77DF421106C8fCdBE08697c949D519f4c05a" })
  wallet_address: string;
}

export class UpdateUser {
  @ApiProperty({default:'0xa8E7CCE298F1C2e52DE6920840d80C28Fc787F72'})
  wallet_address: string;
  @ApiProperty({default:'NewUsername'})
  username: string;
}

export class User {
  @ApiProperty({})
  _id: string;
  @ApiProperty({})
  username: string;
  @ApiProperty({})
  wallet_address: string;
  @ApiProperty({})
  email: string;
  @ApiProperty({})
  createdAt: string;
  @ApiProperty({})
  updatedAt: string;
}

export class deleteUser {
  @ApiProperty({default:'Delete User'})
  status:string
}

export class uploadUserFile {
    @ApiProperty()
    uri: string;
}
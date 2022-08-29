import { ApiProperty } from '@nestjs/swagger';

export class signin {
    @ApiProperty()
    readonly name:string;
    @ApiProperty()
    readonly password:string;
}
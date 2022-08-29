import { ApiProperty } from '@nestjs/swagger';

export class getname {
    @ApiProperty()
    readonly id:number;
    @ApiProperty()
    readonly name:string;
}
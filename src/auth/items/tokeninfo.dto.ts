import { ApiProperty } from '@nestjs/swagger';

export class getnft {
    @ApiProperty()
    readonly cntraddr:number;
    @ApiProperty()
    readonly id:string;
}
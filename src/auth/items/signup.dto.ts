import { ApiProperty } from '@nestjs/swagger';
export class signup {
    @ApiProperty()
    readonly name:string;
    @ApiProperty()
    readonly age:number;
}
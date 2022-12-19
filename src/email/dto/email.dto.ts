import { ApiProperty } from "@nestjs/swagger";
export class SendMail {
    @ApiProperty()
    recepient: string;
    @ApiProperty()
    subject: string;
    @ApiProperty()
    message: string;
}
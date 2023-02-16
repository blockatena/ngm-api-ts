import { ApiProperty } from "@nestjs/swagger";

export class ErrorHandlerType {
    @ApiProperty()
    success: boolean;
    @ApiProperty()
    message: string;
    @ApiProperty()
    error: Error;
}
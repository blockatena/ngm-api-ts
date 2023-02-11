import { ApiProperty } from "@nestjs/swagger";

export class ErrorHandler {
    @ApiProperty()
    success: boolean;
    message: string;
    error: Error;
}
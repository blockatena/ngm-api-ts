import { ApiProperty } from "@nestjs/swagger";

export class ErrorHandler {
  @ApiProperty()
  success: boolean;
  @ApiProperty()
  message: string;
  @ApiProperty()
  error: string;
}

import { ApiProperty } from "@nestjs/swagger";

export class ValidateTransaction {
    @ApiProperty()
    chain: string;
    @ApiProperty()
    transactionHash: string;
}
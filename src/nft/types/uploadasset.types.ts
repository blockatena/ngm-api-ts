import { ApiProperty } from "@nestjs/swagger";

export class UploadAsset {
    @ApiProperty()
    uri: string;
}
export class UploadAssetError {
    @ApiProperty()
    success: boolean;
    @ApiProperty()
    message: string;
    @ApiProperty()
    error: Error;
}
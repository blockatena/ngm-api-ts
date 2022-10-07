import { ApiProperty } from '@nestjs/swagger';

export class CreateDeploymentDto {
  @ApiProperty()
  readonly symbol: string;
  @ApiProperty()
  readonly ownerAddress: string;
  @ApiProperty()
  readonly roles: any[];
  @ApiProperty()
  readonly collectionName: string;
  @ApiProperty()
  readonly chain: string;
}

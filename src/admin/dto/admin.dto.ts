import { ApiProperty } from '@nestjs/swagger';

export class EmptyCollection {
  @ApiProperty()
  collection_name: string;
}
export class UpdateNft {
  @ApiProperty()
  id: string;
  @ApiProperty()
  json: object;
}
export class DeleteKeyBody {
  @ApiProperty()
  key: string;
  @ApiProperty()
  id: string;
}
export class DeleteCronBody {
  @ApiProperty()
  cron_job_id: string;
}

import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Bucket } from './helper/textileHelper';
import { TextileService } from './textile.service';

@ApiTags('Textile')
@Controller('textile')
export class TextileController {
  constructor(private readonly textileService: TextileService) {}

  // Swagger UI Options
  @ApiOperation({
    summary:
      'This api is a demonstration for storing files in a json format while keeping the base link same',
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully Fetched Textile',
  })
  @ApiResponse({
    status: 400,
    description: 'there  is no textile assocaited with given Id',
  })
  /**************************** */
  // Actual Get Route
  @Get('/link')
  async getBucketLink(): Promise<string> {
    try {
      const buckInstance = new Bucket();
      const ipnsLink = await buckInstance.getIpnsLink();
      console.log('ipnsLink: ', ipnsLink);
      return ipnsLink;
    } catch (error) {
      console.log(error);
    }
  }
}

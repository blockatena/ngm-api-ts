import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TextileService } from './textile.service';

@ApiTags('Textile')
@Controller('textile')
export class TextileController {
  constructor(private readonly textileService: TextileService) {}

  // Swagger UI Options
  @ApiOperation({ summary: 'This api will get textile by ID' })
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
  @Get('textile/:id')
  async gettextilebyId(): Promise<string> {
    return 'Got textile';
  }
}

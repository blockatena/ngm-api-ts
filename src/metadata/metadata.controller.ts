import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MetadataService } from './metadata.service';

@ApiTags('Metadata')
@Controller('metadata')
export class MetadataController {
  constructor(private readonly metadataservice: MetadataService) { }
  // Swagger UI Options
  @ApiOperation({
    summary: 'This api is used to get the metadata of a token',
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully Fetched Metadata',
  })
  @ApiResponse({
    status: 400,
    description: 'there is no nft assocaited with given Id',
  })
  /**************************** */
  // Actual Get Route
  @Get('/:contract_address/:token_id')
  async getMetadata(
    @Param('contract_address') contract_address: string,
    @Param('token_id') token_id: string,
  ): Promise<string> {
    try {
      const res = await this.metadataservice.getMetadata(
        contract_address,
        token_id,
      );
      return res;
    } catch (error) {
      console.log(error);
    }
  }

  @Get('/scriptfix')
  async scriptFix(): Promise<string> {
    try {
      // uncomment this line to run the script
      // const res = await this.metadataservice.tokenUriFix();
      // return res;
      return 'uncomment the line first';
    } catch (error) {
      console.log(error);
    }
  }
}

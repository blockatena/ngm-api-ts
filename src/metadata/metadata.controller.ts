import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MetadataService } from './metadata.service';
import {GetMetadata, meta_data} from './schema/metadata.schema'
import { ErrorHandler } from './utils/errorhandler';
@ApiTags('Metadata')
@Controller('metadata')
export class MetadataController {
  constructor(private readonly metadataservice: MetadataService) { }
  // Swagger UI Options
  @ApiOperation({
    summary: 'token metadata',
  })
  @ApiResponse({
    status: 201,
    type: meta_data,
    description: 'Successfully Fetched Metadata',
  })
  @ApiResponse({
    status: 400,
    description: 'there is no nft assocaited with given Id',
  })
  @ApiResponse({
    status: 500,
    type:ErrorHandler
  })
  /**************************** */
  // Actual Get Route
  @Get('/:contract_address/:token_id')
  async getMetadata(
    @Param() GetMetadata:GetMetadata
  ): Promise<string> {
    const {contract_address,token_id} = GetMetadata
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

  // @ApiOperation({
  //   summary: 'scriptfix metadata',
  // })
  // @Get('/scriptfix')
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

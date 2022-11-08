import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { DeleteKeyBody, EmptyCollection, UpdateNft } from './dto/admin.dto';
@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('empty-collection')
  async EmptyCollection(@Body() body: EmptyCollection): Promise<any> {
    return await this.adminService.EmptyCollection(body.collection_name);
  }
  @Post('update-nft')
  async UpdateNft(@Body() body: UpdateNft): Promise<any> {
    // const { contract_address } = body;
    // const data = await this.adminService.GetCollection({ contract_address });
    // console.log(data);
    // return await this.adminService.UpdateNft(
    //   { contract_address },
    //   { contract_details: data },
    // );
    return `you are not admin`;
  }
  @Post('delete-key')
  async DeleteKey(@Body() body: DeleteKeyBody): Promise<any> {
    // const { key } = body;
    // console.log(key);
    // return await this.adminService.DeleteKey({ key });
    return `you are not admin`;
  }
}

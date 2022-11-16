import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import {
  DeleteCronBody,
  DeleteKeyBody,
  EmptyCollection,
  UpdateNft,
} from './dto/admin.dto';
@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}
  @Post('empty-collection')
  async EmptyCollection(@Body() body: EmptyCollection): Promise<any> {
    // return await this.adminService.EmptyCollection(body.collection_name);
  }
  @Post('update-nft')
  async UpdateNft(@Body() body: UpdateNft): Promise<any> {
    const { id, json } = body;

    // return await this.adminService.UpdateNft({ _id: id }, { meta_data: json });
    return `you are not admin`;
  }
  @Post('delete-key')
  async DeleteKey(@Body() body: DeleteKeyBody): Promise<any> {
    const { key, id } = body;
    console.log(key);
    // return await this.adminService.DeleteKey({ key, id });
    return `you are not admin`;
  }

  @Post('delete-cron')
  async deleteCron(@Body() cronjob_id: DeleteCronBody): Promise<any> {
    try {
      return this.adminService.deleteCron(cronjob_id);
      //  return 'You are not admin';
    } catch (error) {}
  }
}

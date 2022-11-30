import { Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ActivityService } from './activity.service';
import {
  GetItemActivity
} from "./dtos/itemdto/item-activity.dto";
@ApiTags('Activity')
@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) { }

  @Get('get-user-activity/:wallet_address')
  async getActivity(@Param('wallet_address') wallet_address: string): Promise<any> {
    try {
      return await this.activityService.getUserActivity(wallet_address);
    } catch (error) {
      console.log(error);
      return {
        message: "something went Wrong",
        error
      }
    }
  }

  @Get('get-item-activity/:contract_address/:token_id')
  async getItemActivity(@Param() get_item_activity: GetItemActivity): Promise<any> {
    try {

      return await this.activityService.getItemActivity(get_item_activity);
    } catch (error) {
      console.log(error);
      return {
        message: "something went Wrong",
        error
      }
    }
  }
}

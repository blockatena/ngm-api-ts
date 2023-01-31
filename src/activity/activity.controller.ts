import { Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ActivityService } from './activity.service';
import {
  GetItemActivity
} from "./dtos/itemdto/item-activity.dto";
import { UserActivity } from './dtos/userdto/user-activity.dto';
// @ApiTags('Activity')
@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) { }
  // @ApiOperation({ summary: 'This API will gives you Users Activity' })
  // @Get('get-user-activity/:wallet_address/:page_number/:items_per_page')
  async getActivity(@Param() userActivity: UserActivity): Promise<any> {
    try {
      return await this.activityService.getUserActivity(userActivity);
    } catch (error) {
      console.log(error);
      return {
        message: "something went Wrong",
        error
      }
    }
  }
  // @ApiOperation({ summary: 'This API will gives you Activity of Particular Item' })
  // @Get('get-item-activity/:contract_address/:token_id/:page_number/:items_per_page')
  async getItemActivity(@Param() get_item_activity: GetItemActivity): Promise<any> {

    try {
      // check whether Item exists or not
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

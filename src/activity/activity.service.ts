import { Injectable, Param } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GetItemActivity } from './dtos/itemdto/item-activity.dto';
import { ReadNotification } from './dtos/read-notification.dto';
import { UserActivity } from './dtos/userdto/user-activity.dto';

import { ActivityDocument, ActivitySchema } from './schema/activity.schema';

@Injectable()
export class ActivityService {
    constructor(@InjectModel(ActivitySchema.name)
    private activityModel: Model<ActivityDocument>) {
        activityModel;
    }
    async createActivity(data: any): Promise<any> {
        try {
            return await this.activityModel.create(data);
        } catch (error) {
            console.log(error);
            return {
                message: "something went Wrong",
                error
            }
        }
    }
    async getUserActivity(data: UserActivity): Promise<any> {
        const { wallet_address, items_per_page, page_number } = data;
        try {
            console.log(data);
            const activity_data = await this.activityModel.find({ $or: [{ from: wallet_address }, { to: wallet_address }] }).sort({ createdAt: -1 }).limit(items_per_page * 1)
                .skip((page_number - 1) * items_per_page)
                .exec();
            const total_pages = await this.activityModel.countDocuments({ $or: [{ from: wallet_address }, { to: wallet_address }] });
            return { total_pages: Math.ceil(total_pages / items_per_page), current_page: page_number, activity_data }
        } catch (error) {
            console.log(error);
            return {
                message: "something went Wrong",
                error
            }
        }
    }
    // 
    async getUserNotifications(data: UserActivity): Promise<any> {
        const { wallet_address, items_per_page, page_number } = data;
        try {
            console.log(data);
            return await this.activityModel.find({ read: 'false', $or: [{ from: wallet_address }, { to: wallet_address }] }).sort({ createdAt: -1 }).limit(items_per_page * 1)
                .skip((page_number - 1) * items_per_page)
                .exec();
        } catch (error) {
            console.log(error);
            return {
                message: "something went Wrong",
                error
            }
        }
    }
    //update notification
    async readNotication(readNotification: ReadNotification): Promise<any> {
        const { log } = console;
        try {
            return await this.activityModel.findOneAndUpdate(readNotification, { $set: { read: true } });
        } catch (error) {
            log(error);
            return {
                error,
            }
        }
    }
    // 
    async getItemActivity(data: GetItemActivity): Promise<any> {
        const { contract_address, token_id, items_per_page, page_number } = data;
        try {
            console.log(data);
            const activity_data = await this.activityModel.find({ "item.contract_address": contract_address, "item.token_id": token_id }).sort({ createdAt: -1 }).limit(items_per_page * 1)
                .skip((page_number - 1) * items_per_page)
                .exec();

            const total_pages = await this.activityModel.countDocuments({ "item.contract_address": contract_address, "item.token_id": token_id });
            return { total_pages: Math.ceil(total_pages / items_per_page), current_page: page_number, activity_data }
        } catch (error) {
            console.log(error);
            return {
                message: "something went Wrong",
                error
            }
        }
    }
}

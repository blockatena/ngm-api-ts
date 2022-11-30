import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GetItemActivity } from './dtos/itemdto/item-activity.dto';

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
    async getUserActivity(data: string): Promise<any> {
        try {
            console.log(data);
            return await this.activityModel.find({ $or: [{ from: data }, { to: data }] });
        } catch (error) {
            console.log(error);
            return {
                message: "something went Wrong",
                error
            }
        }
    }

    async getItemActivity(data: GetItemActivity): Promise<any> {
        const { contract_address, token_id } = data;
        try {
            console.log(data);
            return await this.activityModel.find({ "item.contract_address": contract_address, "item.token_id": token_id }).sort({ createdAt: -1 });
        } catch (error) {
            console.log(error);
            return {
                message: "something went Wrong",
                error
            }
        }
    }
}

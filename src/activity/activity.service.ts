import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ActivityDocument, ActivitySchema } from './schema/activity.schema';

@Injectable()
export class ActivityService {
    constructor(@InjectModel(ActivitySchema.name)
    private activityModel: Model<ActivityDocument>,) {
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
    async getUserActivity(data: any): Promise<any> {
        try {
            return await this.activityModel.find(data);
        } catch (error) {
            console.log(error);
            return {
                message: "something went Wrong",
                error
            }
        }
    }

}

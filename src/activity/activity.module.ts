import { Module } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { ActivityController } from './activity.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivitySchema, activitySchema } from './schema/activity.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ActivitySchema.name, schema: activitySchema },
    ]),
  ],
  controllers: [ActivityController],
  providers: [ActivityService],
  exports: [ActivityService],
})
export class ActivityModule {}

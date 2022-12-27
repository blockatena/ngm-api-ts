import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { UsersModule } from 'src/users/users.module';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [UsersModule, EmailModule],
  controllers: [SubscriptionController],
  providers: [SubscriptionService]
})
export class SubscriptionModule { }

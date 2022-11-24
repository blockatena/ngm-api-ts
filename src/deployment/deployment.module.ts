import { Module } from '@nestjs/common';
import { DeploymentService } from './deployment.service';
import { DeploymentController } from './deployment.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { contractSchema, ContractSchema } from 'src/schemas/contract.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ContractSchema.name, schema: contractSchema },
    ]),
  ],
  controllers: [DeploymentController],
  providers: [DeploymentService],
  exports: [DeploymentService],
})
export class DeploymentModule {}

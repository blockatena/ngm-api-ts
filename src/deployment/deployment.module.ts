import { forwardRef, Module } from '@nestjs/common';
import { DeploymentService } from './deployment.service';
import { DeploymentController } from './deployment.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { contractSchema, ContractSchema } from 'src/schemas/contract.schema';
import { NftModule } from 'src/nft/nft.module';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';

@Module({
  imports: [forwardRef(() => UsersModule),
  MongooseModule.forFeature([
    { name: ContractSchema.name, schema: contractSchema },
  ]),
    // NftModule
  ],
  controllers: [DeploymentController],
  providers: [DeploymentService],
  exports: [DeploymentService],
})
export class DeploymentModule { }

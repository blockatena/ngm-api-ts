import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DeploymentService } from './deployment.service';
import { CreateDeploymentDto } from './dto/create-deployment.dto';
import ethers from 'ethers';
import fs from 'fs-extra';

@ApiTags('Deployment')
@Controller('deployment')
export class DeploymentController {
  constructor(private readonly deploymentService: DeploymentService) {}

  @Post('deploy-contract/')
  async deployContract(@Body() deploymentDto: CreateDeploymentDto) {
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.MATIC_MUMBAI_RPC_URL,
    );
    const wallet = new ethers.Wallet(process.env.PRIV_KEY, provider);
    const abi = fs.readFileSync('./Simple_sol_Simple.abi', 'utf-8');
    const bin = fs.readFileSync('./Simple_sol_Simple.bin', 'utf-8');

    const contractFactory = new ethers.ContractFactory(abi, bin, wallet);
    const contract = await contractFactory.deploy();
    const confirm = await contract.deployed();
    console.log(
      `address: ${contract.address}, txHash: ${confirm.hash} \n\n\n${confirm}`,
    );

    const someBody = deploymentDto;
    console.log(someBody);
  }

  @Post('pause-contract/:cntraddress')
  pauseContract(@Param('cntraddress') cntraddress: string) {}

  @Post('/change-base-uri1155/cntraddr')
  changeBaseURI_1155(@Param('cntraddress') cntraddress: string) {}

  @Get('/update-contract/:cntraddr')
  updateContract(@Param('cntraddress') cntraddress: string) {}
}

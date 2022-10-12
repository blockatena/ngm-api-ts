require('dotenv').config();
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
import { ethers } from 'ethers';
import * as fs from 'fs-extra';
import * as path from 'path';

const provider = new ethers.providers.JsonRpcProvider(
  process.env.MATIC_MUMBAI_RPC_URL,
);
const wallet = new ethers.Wallet(process.env.PRIV_KEY, provider);

@ApiTags('Deployment')
@Controller('deployment')
export class DeploymentController {
  constructor(private readonly deploymentService: DeploymentService) {}

  @Post('deploy-contract')
  async deployContract(@Body() deploymentDto: CreateDeploymentDto) {
    console.log(deploymentDto);

    // Checkong Number of Contracts that this address hold
    if (
      (await this.deploymentService.ContractCount(deploymentDto.ownerAddress)) >
      4
    ) {
      console.log('in');
      return 'you exceeded limit, kindly subscribe to our services';
    }

    // Contract deployment start
    // paths

    const abiPath = path.join(
      process.cwd(),
      `src/utils/constants/${deploymentDto.type}/${deploymentDto.type}.abi`,
    );
    const binPath = path.join(
      process.cwd(),
      `src/utils/constants/${deploymentDto.type}/${deploymentDto.type}.bin`,
    );
    // console.log(abiPath, '  ', binPath);
    //  retrieving abi and bin files through fs module

    console.log(process.cwd());
    const abi = fs.readFileSync(abiPath, 'utf-8');
    const bin = fs.readFileSync(binPath, 'utf-8');
    //

    const contractFactory = new ethers.ContractFactory(abi, bin, wallet);

    // ERC721PSI - (CollectionName , Symbol)
    // ERC721TINY- (CollectionName,Symbol)
    // ERC1155-D - (uri)
    let contract;
    if (deploymentDto.type == 'NGM1155') {
      const _contract = await contractFactory.deploy(
        deploymentDto.collectionName,
        deploymentDto.symbol,
        deploymentDto.uri,
      );
      contract = _contract;
    } else {
      const _contract = await contractFactory.deploy(
        deploymentDto.collectionName,
        deploymentDto.symbol,
      );
      contract = _contract;
    }

    const confirm = await contract.deployed();
    const address = contract.address;
    const hash = confirm.deployTransaction.hash;

    // Contract Deployment End

    // Testing
    // const confirm = 'conformed';
    // const address = 'jbvcbcseredavsdasdbkuu1';
    // const hash = 'sdasdajkhjksdfas';

    //
    console.log(`address: ${address}, txHash: ${hash} \n\n\n${confirm}`);
    //
    const keys = ['ownerAddress', 'symbol', 'chain', 'collectionName', 'type'];
    const arr = {};
    keys.forEach((element) => {
      arr[`${element}`] = deploymentDto[element];
    });
    arr[`transactionhash`] = hash;
    arr[`contractaddress`] = address;
    if (deploymentDto.uri) {
      arr[`uri`] = deploymentDto.uri;
    }
    return await this.deploymentService.InsertContract(arr);
  }
  //
  @Get()
  async gellAll() {
    return await this.deploymentService.getallContractData();
  }
  @Get('GetAll-contracts/:owneraddr')
  async getContractsOfUser(@Param('owneraddr') owneraddr: string) {
    return this.deploymentService.getContractByOwnerAddr(owneraddr);
  }
  @Get('contract-Details/:cntraddr')
  async getContractdetails(@Param('cntraddr') cntraddr: string) {
    console.log(cntraddr);
    return this.deploymentService.getContractDetailsByContractAddress(cntraddr);
  }
  //
  @Post('pause-contract/:cntraddress')
  pauseContract(@Param('cntraddress') cntraddress: string) {}

  @Post('/change-base-uri1155/cntraddr')
  changeBaseURI_1155(@Param('cntraddress') cntraddress: string) {}

  @Get('/update-contract/:cntraddr')
  updateContract(@Param('cntraddress') cntraddress: string) {}
}

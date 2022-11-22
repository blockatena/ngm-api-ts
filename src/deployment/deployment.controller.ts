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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DeploymentService } from './deployment.service';
import { CreateDeploymentDto } from './dto/create-deployment.dto';
import { ethers } from 'ethers';
import * as fs from 'fs-extra';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';
require('dotenv').config();
// const provider = new ethers.providers.JsonRpcProvider(
//   process.env.MATIC_MUMBAI_RPC_URL,
// );
// const wallet = new ethers.Wallet(process.env.PRIV_KEY, provider);
// let contractWithSigner = contract.connect(wallet);

@ApiTags('Deployment')
@Controller('deployment')
export class DeploymentController {
  constructor(
    private readonly configService: ConfigService,
    private readonly deploymentService: DeploymentService,
  ) {}
  //Global
  private MATIC_MUMBAI_RPC_URL = this.configService.get<string>(
    'MATIC_MUMBAI_RPC_URL',
  );
  private PRIV_KEY = this.configService.get<string>('PRIV_KEY');
  private provider = new ethers.providers.JsonRpcProvider(
    this.MATIC_MUMBAI_RPC_URL,
  );
  private wallet = new ethers.Wallet(this.PRIV_KEY, this.provider);
  @ApiOperation({ summary: 'This Api will create a collection' })
  @Post('deploy-contract')
  async deployContract(@Body() deploymentBody: CreateDeploymentDto) {
    console.log(deploymentBody);

    // Checkong Number of Contracts that this address hold
    //  create a constant ***
    if (
      (await this.deploymentService.ContractCount(
        deploymentBody.owner_address,
      )) > process.env.deploy_limit
    ) {
      console.log('in');
      return 'you exceeded limit, kindly subscribe to our services';
    }

    // Contract deployment start
    // paths

    const abiPath = path.join(
      process.cwd(),
      `src/utils/constants/${deploymentBody.type}/${deploymentBody.type}.abi`,
    );
    const binPath = path.join(
      process.cwd(),
      `src/utils/constants/${deploymentBody.type}/${deploymentBody.type}.bin`,
    );
    // console.log(abiPath, '  ', binPath);
    //  retrieving abi and bin files through fs module
    console.log(process.cwd());
    const abi = fs.readFileSync(abiPath, 'utf-8');
    const bin = fs.readFileSync(binPath, 'utf-8');
    //
    console.log('fil read completed');
    const contractFactory = new ethers.ContractFactory(abi, bin, this.wallet);
    console.log('connect to blockchain');
    // ERC721PSI - (CollectionName,Symbol) - NGM721PSI
    // ERC721TINY- (CollectionName,Symbol) - NGMTINY721
    // ERC1155-D - (CollectionName,Symbol,uri) - NGM1155
    let contract = await contractFactory.deploy(
      deploymentBody.collection_name,
      deploymentBody.symbol,
      ' ',
    );
    console.log('deployed');
    // const uri =
    //   'https://bafzbeigcbumfj5l2uerqp4pd76pctqrklhdqsupmhjydp6hriwb42rivbq.textile.space';
    const uri = process.env.API_BASE_URL || 'http://localhost:8080/';
    const confirm = await contract.deployed();
    const address = contract.address;
    const baseUri = `${uri}/metadata/${address}/`;
    const res = await contract.setBaseURI(baseUri);
    const hash = confirm.deployTransaction.hash;

    // Contract Deployment End

    // Testing
    // const confirm = 'conformed';
    // const address = 'jbvcbcseredavsdasdbkuu1';
    // const hash = 'sdasdajkhjksdfas';

    //
    console.log(`address: ${address}, txHash: ${hash} \n\n\n${confirm}`);
    //
    const keys = [
      'owner_address',
      'symbol',
      'chain',
      'collection_name',
      'type',
    ];
    const arr = {};
    keys.forEach((element) => {
      arr[`${element}`] = deploymentBody[element];
    });
    arr[`transactionhash`] = hash;
    arr[`contract_address`] = address;
    arr[`description`] = deploymentBody.description;
    //  /`${uri}/${address}/`
    arr[`baseuri`] = baseUri;
    arr[`imageuri`] = deploymentBody.imageuri;
    return await this.deploymentService.InsertContract(arr);
  }
  //
  // @Get()
  // async gellAll() {
  //   return await this.deploymentService.getallContractData();
  // }
  // @Get('GetAll-contracts/:owneraddr')
  // async getContractsOfUser(@Param('owneraddr') owneraddr: string) {
  //   return this.deploymentService.getContractByOwnerAddr(owneraddr);
  // }

  // @Get('callFunction/:owneraddr')
  // async callFunction(@Param('owneraddr') owneraddr: string) {
  //   // ethersjs call method safe mint ngm721
  //   const abiPath = path.join(
  //     process.cwd(),
  //     `src/utils/constants/NGM721PSI/NGM721PSI.abi`,
  //   );
  //   console.log(process.cwd());
  //   const abi = fs.readFileSync(abiPath, 'utf-8');
  //   const nftCntr = new ethers.Contract(
  //     '0xe528a4898c00F9B48e302B7b3Ba535319fD51bBd',
  //     abi,
  //     wallet,
  //   ); // abi and provider to be declared
  //   console.log('nftContract: ', nftCntr, owneraddr);
  //   const minted = await nftCntr.safeMint(
  //     '0xb7e0BD7F8EAe0A33f968a1FfB32DE07C749c7390',
  //     1,
  //     '0x0',
  //   );
  //   // const minted = await nftCntr.safeMint(owneraddr, 1, '0x0');
  //   // const uri = await nftCntr.name();
  //   const uri = await nftCntr.baseURI(0);
  //   console.log('uri', uri);
  // }

  @Get('contract-Details/:cntraddr')
  async getContractdetails(@Param('cntraddr') cntraddr: string) {
    console.log(cntraddr);
    return this.deploymentService.getContractDetailsByContractAddress(cntraddr);
  }
  // //
  // @Post('pause-contract/:cntraddress')
  // pauseContract(@Param('cntraddress') cntraddress: string) {}

  // @Post('/change-base-uri1155/cntraddr')
  // changeBaseURI_1155(@Param('cntraddress') cntraddress: string) {}

  // @Get('/update-contract/:cntraddr')
  // updateContract(@Param('cntraddress') cntraddress: string) {}
}

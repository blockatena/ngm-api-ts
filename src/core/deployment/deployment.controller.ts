import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DeploymentService } from './deployment.service';
import { CreateDeploymentDto } from './dto/create-deployment.dto';
import { ethers } from 'ethers';
import * as fs from 'fs-extra';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';
import { APIGuard } from 'src/services/roles.guard';
import { log } from 'console';

import { UsersService } from 'src/users/users.service';
import { CommonService } from 'src/common/common.service';
import { collection } from './types/deployment.response';
import { ErrorHandlerType } from 'src/utils/errorhandlers/error.handler';
@ApiTags('Deployment')
@Controller('deployment')
export class DeploymentController {
  constructor(
    private readonly deploymentService: DeploymentService,

    private readonly userService: UsersService,
    private readonly commonService: CommonService


  ) { }
  @ApiResponse({
    status: 201,
    description: "Successfully Created the Collection",
    type: collection
  })
  @ApiResponse({
    status: 500,
    description: "Something went Wrong",
    type: ErrorHandlerType
  })
  @ApiHeader({
    name: 'X-API-HEADER',
    description: 'API Key is needed to deploy the collection'
  })
  @UseGuards(APIGuard)
  @ApiOperation({ summary: 'Deploy a collection' })
  @Post('deploy-contract')
  async deployContract(@Body() deploymentBody: CreateDeploymentDto) {
    log(deploymentBody);
    const { symbol, owner_address, roles, collection_name, chain, type, imageuri,
      description } = deploymentBody;
    try {

      log("CHECKING THE ENVIRONMENT \n");
      const { RPC_URL, API_BASE_URL, provider, wallet } = await this.commonService.getWallet(chain);
      console.log("ENVIRONMENT  DETAILS \n ", { RPC_URL, API_BASE_URL, provider, wallet });


      log("CHECKING THE LIMIT \n")
      const get_limit = await this.userService.getUser({ wallet_address: owner_address });
      const collection_count = await this.deploymentService.ContractCount(owner_address);
      if (Number(get_limit?.limit?.collection) > Number(collection_count)) {
        return `Hello ${owner_address} you exceeded Your Limit `;
      }
      log(`FETCHING THE ${type} CONTRACT \n`)
      const abiPath = path.join(
        process.cwd(),
        `src/utils/constants/${type}/${type}.abi`,
      );
      const binPath = path.join(
        process.cwd(),
        `src/utils/constants/${type}/${type}.bin`,
      );
      // log(abiPath, '  ', binPath);
      //  retrieving abi and bin files through fs module
      log(process.cwd());
      const abi = fs.readFileSync(abiPath, 'utf-8');
      const bin = fs.readFileSync(binPath, 'utf-8');
      //
      log("FILE READ COMPLETED \n");
      const contractFactory = new ethers.ContractFactory(abi, bin, wallet);
      // log(contractFactory);
      log("CONNECTED TO BLOCK-CHAIN \n");
      // ERC721PSI - (CollectionName,Symbol) - NGM721PSI
      // ERC721TINY- (CollectionName,Symbol) - NGMTINY721
      // ERC1155-D - (CollectionName,Symbol,uri) - NGM1155
      const feeData = await provider.getFeeData()
      log("FEE DATA  \n", feeData);

      const contract = await contractFactory.deploy(
        collection_name,
        symbol,
        '0x00',
        { gasPrice: feeData.gasPrice }
      );
      log("DEPLOYED \n");
      log("CONTRACT DETAILS \n", contract);
      // const uri =
      // 'https://bafzbeigcbumfj5l2uerqp4pd76pctqrklhdqsupmhjydp6hriwb42rivbq.textile.space';
      const uri = API_BASE_URL || 'http://localhost:8080/';
      const confirm = await contract.deployed();
      log("CONFIRM", confirm);
      const contract_address = contract.address;
      const baseUri = `${uri}/metadata/${contract_address}/`;
      const res = await contract.setBaseURI(baseUri, { gasPrice: feeData.gasPrice });
      log("SET_BASE_URI  ", res);
      const transactionhash = confirm.deployTransaction.hash;

      log(`ADDRESS: ${contract_address}, TX-HASH: ${transactionhash} \n\n\n${confirm}`);
      //
      const arr = {
        owner_address,
        symbol,
        collection_name,
        chain: { id: res.chainId, name: chain },
        type,
        transactionhash,
        contract_address,
        description,
        baseuri: baseUri,
        imageuri,
      }
      log("INSERTING INTO DB", arr);
      return await this.deploymentService.createContract(arr);
    } catch (error) {
      log(error);
      return {
        error,
        message: "Something went wrong our Team is Looking into it"
      }
    }
  }
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
  //   log(process.cwd());
  //   const abi = fs.readFileSync(abiPath, 'utf-8');
  //   const nftCntr = new ethers.Contract(
  //     '0xe528a4898c00F9B48e302B7b3Ba535319fD51bBd',
  //     abi,
  //     wallet,
  //   ); // abi and provider to be declared
  //   log('nftContract: ', nftCntr, owneraddr);
  //   const minted = await nftCntr.safeMint(
  //     '0xb7e0BD7F8EAe0A33f968a1FfB32DE07C749c7390',
  //     1,
  //     '0x0',
  //   );
  //   // const minted = await nftCntr.safeMint(owneraddr, 1, '0x0');
  //   // const uri = await nftCntr.name();
  //   const uri = await nftCntr.baseURI(0);
  //   log('uri', uri);
  // }
  @ApiResponse({
    status: 201,
    description: "Successfully Fetched the Collection",
    type: collection
  })
  @ApiResponse({
    status: 500,
    description: "Something went Wrong",
    type: ErrorHandlerType
  })
  @ApiOperation({ summary: 'Fetch the Details of the Collection' })
  @Get('contract-Details/:cntraddr')
  async getContractdetails(@Param('cntraddr') cntraddr: string) {
    try {
      log(cntraddr);
      return await this.deploymentService.getContractDetailsByContractAddress(cntraddr);
    }
    catch (error) {
      log(error);
      return { error }
    }
  }
  // //
  // @Post('pause-contract/:cntraddress')
  // pauseContract(@Param('cntraddress') cntraddress: string) {}

  // @Post('/change-base-uri1155/cntraddr')
  // changeBaseURI_1155(@Param('cntraddress') cntraddress: string) {}

  // @Get('/update-contract/:cntraddr')
  // updateContract(@Param('cntraddress') cntraddress: string) {}
}

require('dotenv').config();
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DeploymentService } from './deployment.service';
import { CreateDeploymentDto } from './dto/create-deployment.dto';
import { ethers } from 'ethers';
import * as fs from 'fs-extra';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';
import { GetOwner } from '../nft/nftitems/get-owner.dto';
import { NftService } from 'src/nft/nft.service';
import { APIGuard } from 'src/guards/roles.guard';
import { log } from 'console';
import { GetChain } from 'src/utils/enum/common.enum.';
import { ChainType } from './enum/contract.enum';
import { getEnvironment } from 'src/utils/common';
import { UsersService } from 'src/users/users.service';
@ApiTags('Deployment')
@Controller('deployment')
export class DeploymentController {
  constructor(
    private readonly configService: ConfigService,
    private readonly deploymentService: DeploymentService,
    // private readonly nftService: NftService
    private readonly userService: UsersService
  ) { }

  @ApiHeader({
    name: 'X-API-HEADER',
    description: 'API Key is needed to deploy the collection'
  })
  @UseGuards(APIGuard)
  @ApiOperation({ summary: 'This Api will create a collection' })
  @Post('deploy-contract')
  async deployContract(@Body() deploymentBody: CreateDeploymentDto) {
    log(deploymentBody);
    const { symbol, owner_address, roles, collection_name, chain, type, imageuri,
      description } = deploymentBody;
    try {
      // Get Environment
      const ENVIRONMENT = getEnvironment();
      const check_environment = ENVIRONMENT === 'DEV' || ENVIRONMENT === 'PROD';
      if (!check_environment) {
        return `Invalid Environment check env  current Environment is ${ENVIRONMENT}`;
      }
      log(`Current Environment is ${ENVIRONMENT}`);
      const chain_typee = this.configService.get<any>(
        ENVIRONMENT,
      );
      // chain validation 
      const current_chain = chain.toUpperCase();
      const chains = Object.keys(chain_typee);
      const chain_available = chains.find(chain => chain === current_chain);
      if (!chain_available) {
        return {
          message: `you are on ${ENVIRONMENT} `,
          chains
        }
      }
      // log(`Requested Chain ${chain_typee}`);
      const chain_type = chain_typee[`${current_chain}`];
      log(`RPC is ${chain_type}`);
      // Multi Chain Integration
      const RPC_URL = chain_type;
      //  log("jjjj", RPC_URL);
      const PRIV_KEY = this.configService.get<string>('PRIV_KEY');
      const API_BASE_URL = this.configService.get<string>('API_BASE_URL');
      // const deploy_limit = this.configService.get<string>('deploy_limit');
      log(`RPC_URL   ${RPC_URL} \n
      PRIV_KEY   ${PRIV_KEY} \n
      API_BASE_URL  ${API_BASE_URL} \n
      `)
      // Get 
      const get_limit = await this.userService.getUser({ wallet_address: owner_address });
      const collection_count = await this.deploymentService.ContractCount(owner_address);
      //  check Limit
      if (Number(get_limit?.limit?.collection) > Number(collection_count)) {
        return `Hello ${owner_address} you exceeded Your Limit `;
      }
      // Get Provider
      const provider = new ethers.providers.JsonRpcProvider(
        RPC_URL,
      );
      const wallet = new ethers.Wallet(PRIV_KEY, provider);

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
      log('file read completed');
      const contractFactory = new ethers.ContractFactory(abi, bin, wallet);
      // log(contractFactory);
      log('connected to blockchain');
      // ERC721PSI - (CollectionName,Symbol) - NGM721PSI
      // ERC721TINY- (CollectionName,Symbol) - NGMTINY721
      // ERC1155-D - (CollectionName,Symbol,uri) - NGM1155
      const feeData = await provider.getFeeData()
      log(feeData)
      const contract = await contractFactory.deploy(
        collection_name,
        symbol,
        '0x00',
        { gasPrice: feeData.gasPrice }
      );
      log('deployed');
      log('contract:::', contract);
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

      log(`address: ${contract_address}, txHash: ${transactionhash} \n\n\n${confirm}`);
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
      log(arr);
      return await this.deploymentService.createContract(arr);
    } catch (error) {
      log(error);
      return {
        error,
        message: "Something went wrong our Team is Looking into it"
      }
    }
  }
  //
  @Get('/test-rpc-url')
  async testRpc() {
    try {
      const ETHEREUM_GOERLI_RPC_URL = this.configService.get<string>(
        'ETHEREUM_GOERLI_RPC_URL',
      );
      const PRIV_KEY = this.configService.get<string>('PRIV_KEY');
      const provider = new ethers.providers.JsonRpcProvider(
        ETHEREUM_GOERLI_RPC_URL,
      );
      const wallet = new ethers.Wallet(PRIV_KEY, provider);
      log(wallet);
      return wallet;
    } catch (error) {
      log(error);
      return {
        error,
        message: "something went wrong"
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

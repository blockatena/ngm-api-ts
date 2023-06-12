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
import { APIGuard } from 'src/services/roles.guard';
import { log } from 'console';
import { CommonService } from 'src/common/common.service';
import { collection } from './types/deployment.response';
import { ErrorHandlerType } from 'src/utils/errorhandlers/error.handler';
import { UsersService } from '../users/users.service';
import {
  DefenderRelaySigner,
  DefenderRelayProvider,
} from 'defender-relay-client/lib/ethers';
import { ChainEnum } from 'src/common/enum/chain.enum';
import { ConfigService } from '@nestjs/config';
@ApiTags('Deployment')
@Controller('deployment')
export class DeploymentController {
  private Environment: string;
  constructor(
    private readonly deploymentService: DeploymentService,
    private readonly userService: UsersService,
    private readonly commonService: CommonService,
    private readonly configService: ConfigService,
  ) {
    this.Environment = this.configService.get<string>('ENVIRONMENT');
  }

  @ApiResponse({
    status: 201,
    description: 'Successfully Created the Collection',
    type: collection,
  })
  @ApiResponse({
    status: 500,
    description: 'Something went Wrong',
    type: ErrorHandlerType,
  })
  @ApiHeader({
    name: 'X-API-HEADER',
    description: 'API Key is needed to deploy the collection',
  })
  @UseGuards(APIGuard)
  @ApiOperation({ summary: 'Deploy a collection' })
  @Post('deploy-contract')
  async deployContract(@Body() deploymentBody: CreateDeploymentDto) {
    const {
      symbol,
      owner_address,
      roles,
      collection_name,
      type,
      imageuri,
      description,
    } = deploymentBody;
    try {
      await this.isLimitExceeded({ owner_address });

      const chain = deploymentBody.chain.toUpperCase();

      const isChainAvailble = await this.validateChain(chain);

      if (!isChainAvailble) {
        return `${chain} is  not available on ${this.Environment}`;
      }

      const { API_BASE_URL, signer, provider } =
        await this.getSignerAndProvider(chain);

      console.log({ API_BASE_URL, signer, provider });

      const { abi, bin } = await this.fetchContractFromAbiAndBinFiles({ type });

      console.log(signer);

      const contractFactory = new ethers.ContractFactory(abi, bin, signer);

      console.log(contractFactory);

      log('CONNECTED TO BLOCK-CHAIN \n');

      const feeData = await provider.getFeeData();
      log('FEE DATA  \n', ethers.utils.formatEther(feeData.gasPrice));

      const contract = await contractFactory.deploy(
        collection_name,
        symbol,
        '0x00',
        { gasPrice: feeData.gasPrice },
      );
      log('DEPLOYED \n');
      log('CONTRACT DETAILS \n', contract);
      // const uri =
      // 'https://bafzbeigcbumfj5l2uerqp4pd76pctqrklhdqsupmhjydp6hriwb42rivbq.textile.space';
      const uri = API_BASE_URL || 'http://localhost:8080/';
      const confirm = await contract.deployed();
      log('CONFIRM', confirm);
      const contract_address = contract.address;
      const baseUri = `${uri}/metadata/${contract_address}/`;
      const res = await contract.setBaseURI(baseUri, {
        gasPrice: feeData.gasPrice,
      });
      log('SET_BASE_URI  ', res);
      const transactionhash = confirm.deployTransaction.hash;

      log(
        `ADDRESS: ${contract_address}, TX-HASH: ${transactionhash} \n\n\n${confirm}`,
      );
      //
      const nftInfo = {
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
      };
      log('INSERTING Nft Info into DB', nftInfo);
      return await this.deploymentService.createContract(nftInfo);
    } catch (error) {
      log(error);
      return {
        success: false,
        message: 'Unable to deploy Contract',
        error,
      };
    }
  }

  @ApiResponse({
    status: 201,
    description: 'Successfully Fetched the Collection',
    type: collection,
  })
  @ApiResponse({
    status: 500,
    description: 'Something went Wrong',
    type: ErrorHandlerType,
  })
  @ApiOperation({ summary: 'Fetch the Details of the Collection' })
  @Get('contract-Details/:cntraddr')
  async getContractdetails(@Param('cntraddr') cntraddr: string) {
    try {
      log(cntraddr);
      return await this.deploymentService.getContractDetailsByContractAddress(
        cntraddr,
      );
    } catch (error) {
      log(error);
      return {
        success: false,
        message: 'Unable to fetch Collection Info',
        error,
      };
    }
  }

  async isLimitExceeded({
    owner_address,
  }: {
    owner_address: string;
  }): Promise<any> {
    try {
      log("Checking User's Limit \n");

      const get_limit = await this.userService.getUser({
        wallet_address: owner_address,
      });

      const collection_count = await this.deploymentService.ContractCount(
        owner_address,
      );
      if (Number(get_limit?.limit?.collection) > Number(collection_count)) {
        return `Hello ${owner_address} you exceeded Your Limit `;
      }

      return;
    } catch (error) {
      log(error);
      return {
        success: false,
        message: "Unable to Check User's Limit",
        error,
      };
    }
  }

  async fetchContractFromAbiAndBinFiles({ type }: { type: string }) {
    try {
      log(`FETCHING THE ${type} CONTRACT \n`);
      const abiPath = path.join(
        process.cwd(),
        `src/utils/constants/${type}/${type}.abi`,
      );
      const binPath = path.join(
        process.cwd(),
        `src/utils/constants/${type}/${type}.bin`,
      );

      log(process.cwd());
      const abi = fs.readFileSync(abiPath, 'utf-8');
      const bin = fs.readFileSync(binPath, 'utf-8');
      log('FILE READ COMPLETED \n');
      return {
        abi,
        bin,
      };
    } catch (error) {
      log(error);
      return {
        success: false,
        message: 'Unable to Load Abi or Bin files',
        error,
      };
    }
  }

  async validateChain(chain: string) {
    const currentChain = chain.toUpperCase();
    const availableChains =
      this.commonService.getAvailableChainsOnCurrentEnvironment();
    if (availableChains.includes(currentChain)) {
      return true;
    } else {
      return false;
    }
  }

  async getSignerAndProvider(chain: string) {
    const API_BASE_URL = await this.configService.get('API_BASE_URL');

    if (
      chain === ChainEnum.FILECOIN ||
      chain === ChainEnum.HYPERSPACE ||
      chain === ChainEnum.MANTLE_TESTNET ||
      chain === ChainEnum.MANTLE_MAINET
    ) {
      const { RPC_URL, provider, wallet } = await this.commonService.getWallet(
        chain,
      );
      return {
        API_BASE_URL,
        signer: wallet,
        provider,
      };
    } else {
      const { RELAYER_APIKEY, RELAYER_SECRETKEY } =
        await this.commonService.getRelayerInfo(chain);
      console.log({ RELAYER_APIKEY, RELAYER_SECRETKEY });
      const credentials = {
        apiKey: RELAYER_APIKEY,
        apiSecret: RELAYER_SECRETKEY,
      };
      const provider = new DefenderRelayProvider(credentials);
      const signer = new DefenderRelaySigner(credentials, provider, {
        speed: 'fast',
      });
      return {
        API_BASE_URL,
        signer,
        provider,
      };
    }
  }
}

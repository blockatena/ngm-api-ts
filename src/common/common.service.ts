import { HttpException, Injectable } from '@nestjs/common';
import { log } from 'console';
import { ethers } from 'ethers';
import { ConfigService } from '@nestjs/config';
import { getWalletType } from './types/getwallet.types';
import { formatEther} from 'ethers/lib/utils';
import { ChainEnum } from './enum/chain.enum';
import { Exception } from 'handlebars/runtime';

@Injectable()
export class CommonService {
  private readonly Admin_Wallet = async () => await this.getEnvironmentVar('ADMIN_WALLET');
  private Environment:string;
  constructor(private readonly configService: ConfigService) {
  this.Environment =  this.configService.get<string>("ENVIRONMENT");
  }
  
  // FETCHING THE CORgetOnChainTransactionT ENVIRONMENT EX:DEV AND PROD
  async getEnvironmentVar(variable: string): Promise<string| any> {
    try {
      return this.configService.get<any>(`${variable}`);
    } catch (error) {
      log(error);
      return {
        success:false,
        message:"Unable to Load Vars",
        error
      };
    }
  }
  // INITIALIZING  THE WALLET BASED ON ENVIRONMENT EX: FOR DEV MUMBAI AND GOERLI
  async getWallet(chain: string): Promise<getWalletType | any> {
    try {
      const check_environment = this.Environment === 'DEV' || this.Environment === 'PROD';
      if (!check_environment) {
        log(
          `Invalid Environment check env  current Environment is ${this.Environment}`
        );
      }
      log(`Current Environment is ${this.Environment}`);
      // Multi Chain Integration
      const RPC_URL = await this.getRpcUrl({ chain });
      const PRIV_KEY = await this.getEnvironmentVar('PRIV_KEY');
      const API_BASE_URL = await this.getEnvironmentVar('API_BASE_URL');
      //Get Provider
      const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
      const wallet = new ethers.Wallet(PRIV_KEY, provider);
      return {
        check_environment,
        RPC_URL,
        API_BASE_URL,
        provider,
        wallet,
      };
    } catch (error) {
      return {
        error,
        mesaage: "Unable to Get Wallet",
      };
    }
  }

  async getRpcUrl({
    chain
  }: {
    chain: string;
  }): Promise<any> {
      const chainsAvailble=this.getAvailableChainsOnCurrentEnvironment();
      const currentChain = chain.toUpperCase();
      console.log(chainsAvailble);
      const isChainAvialble = chainsAvailble.find((_chain) => _chain === currentChain);
      console.log(isChainAvialble);
      const rpcUrl =  this.configService.get<any>(this.Environment)[`${currentChain}`];
      log(`RPC is ${rpcUrl} `);
      return rpcUrl;
    } 

    getAvailableChainsOnCurrentEnvironment(){
    const chain_typee = this.configService.get<any>(this.Environment);
    return Object.keys(chain_typee);
  }

  async getTransaction({
    RPC_URL,
    transaction_hash,
  }: {
    RPC_URL: string;
    transaction_hash: string;
  }): Promise<any> {
    try {
      const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
      const { from, to, value } = await provider.getTransaction(
        transaction_hash,
      );
      const amount = formatEther(value);
      const ADMIN_WALLET = await this.Admin_Wallet();
      const isAdminWallet = to === ADMIN_WALLET;
      console.log({ isAdminWallet });
      if (isAdminWallet) {
        // Transaction is verified
        console.log('TRANSACTION IS VERIFIED');
        return { from, to, amount };
      } else {
        console.log('TRANSACTION IS INVALID');
        return {
          error: true,
          message: `Invalid Transaction, Malicious Account Transfer`,
        };
      }
    } catch (error) {
      return error;
    }
  }

  async erc20MrktAddr(chain: string): Promise<any> {
    try {
      const _chain = chain.toUpperCase();
      const ENVIRONMENT = await this.getEnvironmentVar('ENVIRONMENT');
      const erc20_addr = await this.getEnvironmentVar('ERC20_CONTRACT');
      const marketAddress = await this.getEnvironmentVar(
        'MARKETPLACE_CONTRACT',
      );
      
      const marketplaceAddress = marketAddress[`${ENVIRONMENT}`][`${_chain}`];

      const erc20Address = erc20_addr[`${ENVIRONMENT}`][`${_chain}`];
      
      return {
        marketplaceAddress,
        erc20Address,
      };
    } catch (error) {
      return {
        error,
        mesaage: 'something went wrong',
      };
    }
  }
  
  async getRelayerInfo(chain:string){
  try {
       const relayers= (await this.configService.get<any>("RELAYER"))[`${this.Environment}`];           
       const availableChains=Object.keys(relayers);
       console.log("\n",availableChains);
       if(!availableChains.includes(chain)){
        return "Invalid Chain";
       }
       console.log("dasda  \n",relayers);
       return relayers[`${chain}`];
      } catch (error) {
      return{
      success:false,
      message:"Unable to get RelayerInfo",
      error
     }
   }
  }

}

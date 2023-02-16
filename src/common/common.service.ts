import { Injectable } from '@nestjs/common';
import { log } from 'console';
import { ethers } from 'ethers';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class CommonService {

    constructor(private readonly configService: ConfigService) {

    }
    // FETCHING THE CORRECT ENVIRONMENT EX:DEV AND PROD
    async getEnvironmentVar(variable: string): Promise<string> {
        try {
            return this.configService.get<any>(`${variable}`);
        } catch (error) {
            log(error);
            return error;
        }
    }
    // INITIALIZING  THE WALLET BASED ON ENVIRONMENT EX: FOR DEV MUMBAI AND GOERLI
    async getWallet(chain: string): Promise<any> {
        try {
            // Get Environment
            const ENVIRONMENT = await this.getEnvironmentVar('ENVIRONMENT');
            const check_environment = ENVIRONMENT === 'DEV' || ENVIRONMENT === 'PROD';
            if (!check_environment) {
                log(`Invalid Environment check env  current Environment is ${ENVIRONMENT}`);
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
            const chain_type = chain_typee[`${current_chain}`];
            log(`RPC is ${chain_type}`);
            // Multi Chain Integration
            const RPC_URL = chain_type;
            const PRIV_KEY = await this.getEnvironmentVar('PRIV_KEY');
            const API_BASE_URL = await this.getEnvironmentVar('API_BASE_URL');
            //Get Provider
            const provider = new ethers.providers.JsonRpcProvider(
                RPC_URL,
            );

            const wallet = new ethers.Wallet(PRIV_KEY, provider);
            return {
                check_environment,
                RPC_URL,
                API_BASE_URL,
                provider,
                wallet,
            }
        } catch (error) {
            return {
                error,
                mesaage: 'something went wrong'
            }
        }
    }

    async erc20MrktAddr(chain: string,): Promise<any> {
        try {
            const _chain = chain.toUpperCase()
            console.log("CHAIN", { _chain })
            const ENVIRONMENT = await this.getEnvironmentVar('ENVIRONMENT');
            const erc20_addr = await this.getEnvironmentVar('ERC20_CONTRACT');
            const marketAddress = await this.getEnvironmentVar('MARKETPLACE_CONTRACT');
            const marketplaceAddress = marketAddress[`${ENVIRONMENT}`][`${_chain}`];
            console.log("marketplaceAddress \n", marketAddress);
            const erc20Address = erc20_addr[`${ENVIRONMENT}`][`${_chain}`];
            console.log("erc20Address \n", erc20Address);
            return {
                marketplaceAddress,
                erc20Address
            }
        } catch (error) {
            return {
                error,
                mesaage: 'something went wrong'
            }
        }
    }
}

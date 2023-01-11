// 
import { log } from 'console';
import { retry } from 'rxjs';
import configuration from 'src/config/configuration';
import { ethers } from 'ethers';

export function getEnvironment(): string {
    try {
        return configuration().ENVIRONMENT;
    } catch (error) {
        log(error);
        return error;
    }
}
interface WalletData {
    RPC_URL: string,
    PRIV_KEY: string,
}
type WalletObj = {
    provider: ethers.providers.JsonRpcProvider,
    wallet: ethers.Wallet,
}

export function getWallet(walletData: WalletData): WalletObj {
    const { RPC_URL,
        PRIV_KEY } = walletData;
    try {
        log("wallet Data :::::", walletData);
        const provider = new ethers.providers.JsonRpcProvider(
            RPC_URL,
        );
        const wallet = new ethers.Wallet(PRIV_KEY, provider);
        log(provider, wallet);

        return {
            provider,
            wallet
        }
    } catch (error) {
        log(error);
        return;
    }
}


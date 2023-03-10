import { ethers } from "ethers"

export type getWalletType = {
    check_environment: boolean,
    RPC_URL: string,
    API_BASE_URL: string,
    provider: ethers.providers.JsonRpcProvider
    wallet: ethers.Wallet
}

export default () => ({
  PORT: process.env.PORT,
  RPC_URL: process.env.RPC_URL,
  ENVIRONMENT: process.env.ENVIRONMENT,
  TEXTILE: {
    USER_IDENTITY: process.env.TEXTILE_USER_IDENTITY,
    BUCKET_NAME: process.env.TEXTILE_BUCKET_NAME,
    KEY: process.env.TEXTILE_KEY,
    SECRET: process.env.TEXTILE_SECRET,
    BUCKET_URL: process.env.TEXTILE_BUCKET_URL,
  },
  DEV: {
    GOERLI: process.env.GOERLI_RPC_URL,
    MUMBAI: process.env.MUMBAI_RPC_URL,
  },
  PROD: {
    ETHEREUM: process.env.ETHEREUM_RPC_URL,
    POLYGON: process.env.POLYGON_RPC_URL,
  },
  REDIS: {
    HOST: process.env.REDIS_HOST,
    PORT: process.env.REDIS_PORT,
    DB: process.env.REDIS_DB,
  },
  EMAIL: {
    EMAIL_ADDR: process.env.EMAIL_ADDR, EMAIL_PASSWORD: process.env.EMAIL_PASSWORD
  },
  RATE_LIMIT: {
    TTL: process.env.REQUEST_TTL,
    LIMIT: process.env.REQUEST_LIMIT
  },
  PRIV_KEY: process.env.PRIV_KEY,
  ATLAS: process.env.ATLAS,
  NFT_STORAGE_KEY: process.env.NFT_STORAGE_KEY,
  API_BASE_URL: process.env.API_BASE_URL,
  MARKETPLACE_CONTRACT_ADDRESS: process.env.MARKETPLACE_CONTRACT_ADDRESS,
  ERC20_TOKEN_ADDRESS: process.env.ERC20_TOKEN_ADDRESS,
  CRON_TIME: process.env.CRON_TIME,
});

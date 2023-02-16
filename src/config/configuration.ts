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
    EMAIL_ADDR: process.env.EMAIL_ADDR,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  },
  RATE_LIMIT: {
    TTL: process.env.REQUEST_TTL,
    LIMIT: process.env.REQUEST_LIMIT,
  },
  PRIV_KEY: process.env.PRIV_KEY,
  ATLAS: process.env.ATLAS,
  NFT_STORAGE_KEY: process.env.NFT_STORAGE_KEY,
  API_BASE_URL: process.env.API_BASE_URL,
  MARKETPLACE_CONTRACT_ADDRESS: process.env.MARKETPLACE_CONTRACT_ADDRESS,
  ERC20_TOKEN_ADDRESS: process.env.ERC20_TOKEN_ADDRESS,
  CRON_TIME: process.env.CRON_TIME,
  ERC20_CONTRACT: {
    DEV: {
      GOERLI: '0x5c0e458b9652f5656351c80e8ab308d74343c971',
      MUMBAI: '0x197a176C17eA881fa9c6cF64A0096B7F2633cA2F',
    },
    PROD: {
      ETHEREUM: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      POLYGON: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
    },
  },
  MARKETPLACE_CONTRACT: {
    DEV: {
      GOERLI: '0x393d5645CF11aeD51Cd8BcFDE7e7D82100d0f2f3',//updated  done
      MUMBAI: '0x70C9c656453cFB577522dDE9A9780562C986EB63',//updated done
    },
    PROD: {
      ETHEREUM: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', //not updated yet
      POLYGON: '0xD2183cE465320Add7E67642EfdD05f2Bd8907342',//updated
    },
  },
});
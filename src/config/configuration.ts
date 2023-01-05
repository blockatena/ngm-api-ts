export default () => ({
  PORT: process.env.PORT,
  RPC_URL: process.env.RPC_URL,
  TEXTILE: {
    USER_IDENTITY: process.env.TEXTILE_USER_IDENTITY,
    BUCKET_NAME: process.env.TEXTILE_BUCKET_NAME,
    KEY: process.env.TEXTILE_KEY,
    SECRET: process.env.TEXTILE_SECRET,
    BUCKET_URL: process.env.TEXTILE_BUCKET_URL,
  },

  MATIC_MUMBAI_RPC_URL: process.env.MATIC_MUMBAI_RPC_URL,
  REDIS: {
    HOST: process.env.REDIS_HOST,
    PORT: process.env.REDIS_PORT,
    DB: process.env.REDIS_DB,
  },
  EMAIL: { EMAIL_ADDR: process.env.EMAIL_ADDR, EMAIL_PASSWORD: process.env.EMAIL_PASSWORD },
  PRIV_KEY: process.env.PRIV_KEY,
  ATLAS: process.env.ATLAS,
  ExpiresIn: process.env.ExpiresIn,
  jwtSecret: process.env.jwtSecret,
  NFT_STORAGE_KEY: process.env.NFT_STORAGE_KEY,
  API_BASE_URL: process.env.API_BASE_URL,
  MARKETPLACE_CONTRACT_ADDRESS: process.env.MARKETPLACE_CONTRACT_ADDRESS,
  ERC20_TOKEN_ADDRESS: process.env.ERC20_TOKEN_ADDRESS,
  CRON_TIME: process.env.CRON_TIME,
});

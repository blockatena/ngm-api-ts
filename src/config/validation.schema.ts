import *as Joi from "joi";
const ConfigValidation = Joi.object({

    // APP_PORT
    PORT: Joi.number().required(),

    // APP_ENVIRONMENT
    ENVIRONMENT: Joi.string().valid('DEV', 'PROD'),

    // TEXTILE
    TEXTILE_USER_IDENTITY: Joi.string().required(),
    TEXTILE_BUCKET_NAME: Joi.string().required(),
    TEXTILE_KEY: Joi.string().required(),
    TEXTILE_SECRET: Joi.string().required(),
    TEXTILE_BUCKET_URL: Joi.string().required(),

    // MAIN_NET RPC_URL
    ETHEREUM_RPC_URL: Joi.string().required(),
    FILECOIN: Joi.string().required(),
    POLYGON_RPC_URL: Joi.string().required(),

    // TEST_NET_RPC_URL
    MUMBAI_RPC_URL: Joi.string().required(),
    GOERLI_RPC_URL: Joi.string().required(),
    HYPERSPACE: Joi.string().required(),
    RPC_URL: Joi.string().required(),

    // REDIS
    REDIS_HOST: Joi.string().required(),
    REDIS_PORT: Joi.string().required(),
    REDIS_DB: Joi.string().required(),

    // WALLET_PRIVATE_KEY
    PRIV_KEY: Joi.string().required(),

    // MONGO_DB_ATLAS_URL
    ATLAS: Joi.string().required(),

    // JWT
    JWT_EXPIRES: Joi.string().required(),
    JWT_SECRET: Joi.string().required(),

    // NFT_STORAGE_KEY
    NFT_STORAGE_KEY: Joi.string().required(),

    API_BASE_URL: Joi.string().required(),

    // CRON 
    CRON_TIME: Joi.string().required(),

    // EMAIL 
    EMAIL_ADDR: Joi.string().required(),
    EMAIL_PASSWORD: Joi.string().required(),

    // ADMIN_SECRET_KEY
    ADMIN_SECRET: Joi.string().required(),

    // ADMIN_WALLET
    ADMIN_WALLET: Joi.string().required(),

    // RATE_LIMITTER
    REQUEST_LIMIT: Joi.string().required(),
    REQUEST_TTL: Joi.string().required(),
});

export default ConfigValidation;
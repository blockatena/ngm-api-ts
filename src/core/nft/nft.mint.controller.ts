import {
    Body,
    Controller,
    Get,
    Param,
    ParseFilePipe,
    UploadedFile,
    UseInterceptors,
    Post,
    UseGuards,
    MaxFileSizeValidator,
} from '@nestjs/common';
import { NftService } from './nft.service';
import { ethers } from 'ethers';
import {
    ApiBody,
    ApiConsumes,
    ApiHeader,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
// import { RedisCliService } from '../redis-cli/redis-cli.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
// import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/services/@decorators/roles.decorator';
import { Role } from 'src/services/enum/roles.enum';
import { NFTStorage, File, Blob } from 'nft.storage';
import { MintToken } from './dtos/mintToken.dto';
import * as fs from 'fs-extra';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';
import { ActivityService } from 'src/activity/activity.service';
import { APIGuard } from 'src/services/roles.guard';
import { ErrorHandlerType } from 'src/utils/errorhandlers/error.handler';
import { G2Web3_1155 } from './dtos/nft1155.dto';
import { Get1155AssetOwner, Get1155NewlyMintedResponse } from './dtos/getnft1155.dto';
import { CommonService } from 'src/common/common.service';
import { GetSingleNft } from './types/nft721.types';
import { UploadAsset, UploadAssetError } from './types/uploadasset.types';
import { DeploymentService } from '../deployment/deployment.service';
import { NftMarketplaceService } from '../marketplace/marketplace.service';
import { UsersService } from '../users/users.service';
const { log } = console;

@ApiTags('Mint')
@Controller('nft')
export class NftMintController {
    constructor(
        private configService: ConfigService,
        private nftservice: NftService,
        private readonly nftMarketPlaceService: NftMarketplaceService,
        // private RedisService: RedisCliService,
        private deploymentService: DeploymentService,
        private activityService: ActivityService,
        private usersService: UsersService,
        private readonly commonService: CommonService,
    ) { }
    private NFT_STORAGE_KEY = this.configService.get<string>('NFT_STORAGE_KEY');
    private token = this.NFT_STORAGE_KEY;
    private storage = new NFTStorage({ token: this.token });

    // File Upload
    @ApiResponse({
        status: 200,
        description: `Successfully Get the <b>URI</b> of your Asset`,
        type: UploadAsset
    })

    @ApiResponse({
        status: 400,
        type: UploadAssetError,
        description: ``
    })
    @ApiResponse({
        status: 500,
        type: UploadAssetError,
        description: `Something went wrong in out server.`
    })
    @ApiOperation({
        summary: 'Upload  asset and gets you URI of that asset',
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' },
            },
        },
    })
    @UseInterceptors(
        FileInterceptor('file'),
    )
    @Post('uploadFile')
    async uploadFile(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 50000000 }),
                    // new FileTypeValidator({ fileType: 'text' }),
                ],
            }),
        )
        file: Express.Multer.File,
    ): Promise<UploadAsset | UploadAssetError> {
        try {
            log(file);
            const blob = new Blob([file.buffer]);
            const toUploadFile = new File([blob], `/${file.originalname}`, {
                type: file.mimetype,
            });
            const cid = await this.storage.storeDirectory([toUploadFile]);
            const tokenUri = `https://nftstorage.link/ipfs/${cid}/${file.originalname}`;
            log({ tokenUri });
            return { uri: tokenUri };
        } catch (error) {
            return {
                success: false,
                message: `Something went Wrong Please Raise a Ticket or contact Support :<b>gamestoweb3@gmail.com</b>`,
                error
            };
        }
    }



    @ApiResponse({
        status: 201,
        description: 'Successfully Minted the Asset',
        type: GetSingleNft
    })
    @ApiResponse({
        status: 500,
        description: 'Something went Wrong',
        type: ErrorHandlerType
    })
    @ApiOperation({
        summary: 'Mint G2W3 721 Asset',
    })
    @ApiHeader({
        name: 'X-API-HEADER',
        description: 'API key needed for mint'
    })
    @UseGuards(APIGuard)
    @Post('mint-nft')
    async mintNft(@Body() body: MintToken) {
        const { contract_address, token_owner, name,
            image_uri,
            description,
            external_uri,
            attributes, wallet_address } = body;
        try {
            const contract_details =
                await this.deploymentService.getContractDetailsByContractAddress(
                    contract_address,
                );
            // check contract is present ot not
            if (!contract_details) {
                return `Collection address is Incorrect or Collection Doesnt exist`;
            }
            const type = contract_details.type;
            log("CONTRACT_DETAILS \n", contract_details);

            //  ONLY COLLECTION OWNER CAN MINT
            // if (!(token_owner === contract_details.owner_address)) {
            //   return `Only the Contract Owner should Mint the NFT`
            // }

            // Multi Chain Integration
            const _chain = contract_details?.chain?.name;
            const { RPC_URL, API_BASE_URL, provider, wallet, check_environment } = await this.commonService.getWallet(_chain);
            if (!check_environment) {
                return `Invalid Environment`;
            }

            log("completed \n");
            log("CHECKING THE LIMIT \n")
            // check limit
            const get_limit = await this.usersService.getUser({ wallet_address: wallet_address });
            const asset_limit = get_limit?.limit?.assets
            // const check_limit = await this.nftservice.checKLimit(asset_limit, body.your_address)
            if (!asset_limit || asset_limit === 0) {
                return {
                    message: 'Your Maximum Minting Limit Reached'
                };
            }

            log(contract_details);
            const abiPath = path.join(
                process.cwd(),
                `src/utils/constants/${type}/${type}.abi`,
            );
            log(process.cwd());
            const abi = fs.readFileSync(abiPath, 'utf-8');
            // mint token using ethersjs
            const nftCntr = new ethers.Contract(
                contract_address,
                abi,
                wallet,
            );
            log("CONTRACT CONNECTED \n ");
            const feeData = await provider.getFeeData();
            log("FEE DATA ", feeData);
            const mintToken = await nftCntr.mint(
                ethers.utils.getAddress(token_owner),
                1,
                { gasPrice: feeData.gasPrice }
            );
            log("\n MINTING TOKEN \n", mintToken);
            const res = await mintToken.wait();

            log('RESPONSE FROM BLOCK CHAIN \n', res);

            const tokenId = parseInt(res.events[0].args.tokenId._hex || '0');
            // const tokenURI = await nftCntr.tokenURI(parseInt(tokenId));
            const jsonData = {
                name,
                image: image_uri,
                description,
                external_uri,
                attributes,
            };
            const jsonBlob = new Blob([JSON.stringify(jsonData)]);
            const cid = await this.storage.storeBlob(jsonBlob);
            const nftStorageUri = `https://nftstorage.link/ipfs`;
            const baseApiUri = API_BASE_URL || 'http://localhost:8080';
            log(baseApiUri, 'baseApiUri');
            const meta_data_url = `${baseApiUri}/metadata/${contract_address}/${tokenId}`;
            const ipfsMetadataUri = `${nftStorageUri}/${cid}`;

            log('ipfsMetadataUri', ipfsMetadataUri);
            const chain = { id: res.chainId, name: _chain };
            const collection = await this.nftservice.getNftsByCollection(
                body.contract_address,
            );
            // log(collection);
            // log('here', collection.length);
            if (collection.length < 3) {
                this.nftservice.pushImagesToCollection(
                    contract_address,
                    image_uri,
                );
            }
            //
            log('metadata');
            const arrdb = {
                contract_address,
                contract_type: type,
                token_id: tokenId,
                chain: { id: mintToken.chainId, name: _chain },
                meta_data_url,
                is_in_auction: false,
                token_owner: ethers.utils.getAddress(body.token_owner),
                meta_data: jsonData,
            };
            console.table(arrdb);
            //add to Activity
            await this.activityService.createActivity({
                event: 'Minted',
                item: {
                    name: jsonData.name,
                    contract_address: arrdb.contract_address,
                    token_id: arrdb.token_id,
                    image: jsonData.image,
                },
                price: 0,
                quantity: 1,
                transaction_hash: mintToken.hash,
                from: '0x0000000000000000000000000000000000000000',
                to: ethers.utils.getAddress(body.token_owner),
                read: false,
            });
            const updateUser = await this.usersService.updateUser(wallet_address, { "limit.assets": asset_limit - 1 })
            //  ADD OWNER TO COLLECTION
            await this.nftservice.addOwner({ contract_address, token_owner });
            const data = await this.nftservice.createNft(arrdb);
            log(data);
            const metadata = await this.nftservice.pushTokenUriToDocArray(
                contract_address,
                ipfsMetadataUri,
                tokenId,
                type,
                chain
            );
            return data;
        }
        catch (error) {
            log(error);
            return {
                message: "Something went Wrong",
                error
            }
        }
    }


    @ApiResponse({
        status: 201,
        description: `Successfully Minted the Asset`,
        type: Get1155NewlyMintedResponse
    })
    @ApiResponse({
        status: 201,
        description: `Successfully Minted the Asset`,
        type: Get1155AssetOwner
    })
    @ApiResponse({
        status: 500,
        description: `Something went wrong in Server`,
        type: ErrorHandlerType
    })
    @ApiHeader({
        name: 'X-API-HEADER',
        description: 'API key needed for mint'
    })
    @UseGuards(APIGuard)
    @ApiOperation({ summary: "Mint G2W3 1155 Tokens" })
    @Post('mint-1155')
    async g2Web31155(@Body() body: G2Web3_1155): Promise<any> {
        const {
            token_owner,
            token_id,
            number_of_tokens,
            contract_address,
            name,
            image_uri,
            attributes,
            description,
            external_uri,
            wallet_address
        } = body
        try {
            // GET CONTRACT
            const contract_details =
                await this.deploymentService.getContractDetailsByContractAddress(
                    contract_address,
                );
            // check contract is present ot not
            if (!contract_details) {
                return `Collection address is Incorrect or Collection Doesnt exist`;
            }
            const type = contract_details.type;
            log("CONTRACT_DETAILS \n", contract_details);

            //  ONLY COLLECTION OWNER CAN MINT
            // if (!(token_owner === contract_details.owner_address)) {
            //   return `Only the Contract Owner should Mint the NFT`
            // }

            // Multi Chain Integration
            const _chain = contract_details?.chain?.name;
            const { RPC_URL, API_BASE_URL, provider, wallet, check_environment } = await this.commonService.getWallet(_chain);
            if (!check_environment) {
                return `Invalid Environment`;
            }

            // check limit
            const get_limit = await this.usersService.getUser({ wallet_address: wallet_address });
            const asset_limit = get_limit?.limit?.assets
            // const check_limit = await this.nftservice.checKLimit(asset_limit, body.your_address)
            if (!asset_limit || asset_limit === 0) {
                return {
                    message: 'Your Maximum Minting Limit Reached'
                };
            }

            log(contract_details);
            const abiPath = path.join(
                process.cwd(),
                `src/utils/constants/NGM1155/NGM1155.abi`,
            );
            // log(process.cwd());
            const abi = fs.readFileSync(abiPath, 'utf-8');
            // mint token using ethersjs
            const nftCntr = new ethers.Contract(
                contract_address,
                abi,
                wallet,
            ); // abi and provider to be declared
            log('nftContract::::::', nftCntr);
            const feeData = await provider.getFeeData();

            //  Minting Part
            const mintToken = await nftCntr.mint(
                ethers.utils.getAddress(token_owner),
                token_id,
                number_of_tokens,
                "0x00",
            );
            // here
            log('MINTING TOKEN \n', mintToken);
            const res = await mintToken.wait(1);
            log('BLOCK CHAIN RESPONSE \n', res);
            // const tokenId = parseInt(res?.events[0]?.args?.tokenId?._hex || '0');
            // const tokenURI = await nftCntr.tokenURI(parseInt(tokenId));
            const jsonData = {
                name,
                image: image_uri,
                description,
                external_uri,
                attributes,
            };
            const jsonBlob = new Blob([JSON.stringify(jsonData)]);
            const cid = await this.storage.storeBlob(jsonBlob);
            const nftStorageUri = `https://nftstorage.link/ipfs`;
            const baseApiUri = API_BASE_URL || 'http://localhost:8080';
            log(baseApiUri, 'baseApiUri');
            const meta_data_url = `${baseApiUri}/metadata/${contract_address}/${token_id}`;
            const ipfsMetadataUri = `${nftStorageUri}/${cid}`;

            log('ipfsMetadataUri', ipfsMetadataUri);
            console.log("chain id ", mintToken.chainId);
            const chain = { id: mintToken.chainId || 5, name: _chain };
            const collection = await this.nftservice.getNftsByCollection(
                contract_address,
            );
            // log(collection);
            // log('here', collection.length);
            if (collection.length < 3) {
                this.nftservice.pushImagesToCollection(
                    contract_address,
                    image_uri,
                );
            }
            //
            log('metadata');

            const arrdb = {
                contract_address,
                contract_type: type,
                token_id,
                number_of_tokens,
                chain: { id: mintToken.chainId, name: _chain },
                meta_data_url,
                is_in_auction: false,
                token_owner: ethers.utils.getAddress(body.token_owner),
                meta_data: jsonData,
            };

            log(arrdb);
            //add to Activity
            const user_stake = {
                contract_address,
                token_id,
                chain,
                token_owner,
                number_of_tokens,
            }
            await this.activityService.createActivity({
                event: 'Minted',
                item: {
                    name: jsonData.name,
                    contract_address: arrdb.contract_address,
                    token_id: `${arrdb.token_id}`,
                    image: jsonData.image,
                },
                price: 0,
                quantity: number_of_tokens,
                transaction_hash: mintToken.hash,
                from: '0x0000000000000000000000000000000000000000',
                to: ethers.utils.getAddress(body.token_owner),
                read: false,
            });

            const is_nft_exists = await this.nftservice.get1155Nft({ contract_address, token_id });
            if (is_nft_exists) {
                // update limit

                const updateNft = await this.nftservice.update1155Nft({ contract_address, token_id }, { 'number_of_tokens': is_nft_exists.number_of_tokens + number_of_tokens })
                //  if it is the owner exists increment the Quantity
                const get_owners = await this.nftservice.get1155NftOwnersforSingleNft({ contract_address, token_id });

                // check owner exists or not
                const is_owner_exists = get_owners.find(owner => owner.token_owner === token_owner);
                console.log(is_owner_exists);

                if (is_owner_exists) {
                    const update_Tokens = await this.nftservice.updateTokens({
                        contract_address,
                        token_id,
                        token_owner,
                        _tokens: number_of_tokens,
                        operation: 'INCREMENT'
                    });
                    return update_Tokens;
                }
                const updateUser = await this.usersService.updateUser(wallet_address, { "limit.assets": asset_limit - 1 })
                const user_1155 = await this.nftservice.create1155NftOwner(user_stake);
                log(user_1155);
                return user_1155;
            }
            // if nft is already present update the nft or skip it 
            const data = await this.nftservice.create1155Nft(arrdb);
            // log(data); 
            const user_1155 = await this.nftservice.create1155NftOwner(user_stake);
            log(user_1155);
            const metadata = await this.nftservice.pushTokenUriToDocArray(
                contract_address,
                ipfsMetadataUri,
                token_id,
                type,
                chain
            );
            return { data, user_1155 };
        } catch (error) {
            log(error);
            return {
                success: false,
                message: 'something went wrong',
                error
            }
        }
    }


    //

}
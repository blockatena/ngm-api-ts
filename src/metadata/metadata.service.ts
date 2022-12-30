import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ethers } from 'ethers';
import { Model } from 'mongoose';
import * as fs from 'fs-extra';
import * as path from 'path';
import {
  ContractDocument,
  ContractSchema,
  contractSchema,
} from 'src/schemas/contract.schema';
import { NftDocument, NftSchema } from 'src/nft/schema/nft.schema';
import { NFTStorage, Blob } from 'nft.storage';
import { NftService } from 'src/nft/nft.service';
import { metadata, metadataDocument } from './schema/metadata.schema';
require('dotenv').config();

const provider = new ethers.providers.JsonRpcProvider(
  process.env.MATIC_MUMBAI_RPC_URL,
);
const wallet = new ethers.Wallet(process.env.PRIV_KEY, provider);
const token = process.env.NFT_STORAGE_KEY;
const storage = new NFTStorage({ token });

@Injectable()
export class MetadataService {
  constructor(
    private readonly httpService: HttpService,
    @InjectModel(metadata.name) private MetadataModel: Model<metadataDocument>,
    @InjectModel(NftSchema.name) private NftModel: Model<NftDocument>,
    @InjectModel(ContractSchema.name)
    private ContractModel: Model<ContractDocument>,
    private nftservice: NftService,
  ) {
    MetadataModel;
  }

  async getMetadata(
    contract_address: string,
    token_id: string,
    chain = 'Polygon',
  ): Promise<any> {
    const metadataDoc = await this.MetadataModel.findOne({
      contract_address,
      chain,
    });
    if (metadataDoc) {
      const uri = metadataDoc.tokenUri[parseInt(token_id)].uri;
      const res = await this.httpService.axiosRef.get(uri);
      return res.data;
    } else {
      return 'Token Doesnt exist';
    }
  }

  async tokenUriFix() {
    try {
      const collections = await this.ContractModel.find();
      for (let i = 0; i < collections.length; i++) {
        const collection = collections[i];
        const contract_address = collection['contract_address'];
        if (contract_address == '0xfc4b9e15b9b94e8d48dCBC8F11575e8fdaaD58Fd') {
          const contract_type = collection['type'];
          // ---- The below is for smart contract uri fix ----
          //uncomment this when needed
          // const res1 = await this.updateSmartContractTokenUri(
          //   contract_address,
          //   contract_type,
          // );

          // ---- The below is for updating the metadata uri for mongo for every nft ----
          const nfts = await this.NftModel.find({ contract_address }).sort({
            token_id: 1,
          });
          for (let j = 0; j < nfts.length; j++) {
            const nft = nfts[j];
            const token_id = nft['token_id'];
            const res = await this.updateTokenData(
              contract_address,
              token_id,
              contract_type,
              nft['meta_data_url'],
            );
          }
          // update the baseUri for contract
          const baseApiUri =
            process.env.API_BASE_URL || 'http://localhost:8080';
          const baseuri = `${baseApiUri}/metadata/${contract_address}/`;
          const res = await this.ContractModel.findOneAndUpdate(
            { contract_address },
            { baseuri },
          );
        }
      }
      return 'done';
    } catch (error) {
      console.log(error);
    }
  }

  async updateSmartContractTokenUri(
    contract_address: string,
    contract_type: string,
  ) {
    const abiPath = path.join(
      process.cwd(),
      `src/utils/constants/${contract_type}/${contract_type}.abi`,
    );
    const binPath = path.join(
      process.cwd(),
      `src/utils/constants/${contract_type}/${contract_type}.bin`,
    );
    const baseApiUri = process.env.API_BASE_URL || 'http://localhost:8080';
    const abi = fs.readFileSync(abiPath, 'utf-8');
    const bin = fs.readFileSync(binPath, 'utf-8');
    const nftCntr = new ethers.Contract(contract_address, abi, wallet); // abi and provider to be declared
    const baseTokenUri = `${baseApiUri}/metadata/${contract_address}/`;
    const res = await nftCntr.setBaseURI(baseTokenUri);
    const tx = await res.wait(1);
    console.log(`Updated ${contract_address}`);
    return 'done';
  }

  async updateTokenData(
    contract_address: string,
    token_id: string,
    contract_type: string,
    tokenUri: string,
  ) {
    // const textileUri = `https://bafzbeigcbumfj5l2uerqp4pd76pctqrklhdqsupmhjydp6hriwb42rivbq.textile.space/${contract_address}/${token_id}.json`; // this needs to be changed afterwards
    // const metadataJson = await this.httpService.axiosRef.get(
    //   tokenUri.replace(
    //     'https://ngm-api-tpnng.ondigitalocean.app',
    //     'http://[::1]:8080',
    //   ),
    // );
    // //update the metadata in mongo nftschema
    // const baseApiUri = process.env.API_BASE_URL || 'http://localhost:8080';
    // const nftStorageUri = `https://nftstorage.link/ipfs`;
    // const metadataUri = `${baseApiUri}/metadata/${contract_address}/${token_id}`;
    // const nft = await this.NftModel.findOneAndUpdate(
    //   { contract_address, token_id },
    //   { $set: { meta_data: metadataJson.data, meta_data_url: metadataUri } },
    // );

    // const jsonBlob = new Blob([JSON.stringify(metadataJson.data)]);
    // const cid = await storage.storeBlob(jsonBlob);
    // const ipfsMetadataUri = `${nftStorageUri}/${cid}`;
    // console.log('ipfsMetadataUri', ipfsMetadataUri);

    // const metadata = await this.nftservice.pushTokenUriToDocArray(
    //   contract_address,
    //   ipfsMetadataUri,
    //   parseInt(token_id),
    //   contract_type,
    //   chain
    // );
    // console.log(contract_address, token_id, '-----\n');
  }
}

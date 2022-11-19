export class GetAssetsResponse {
  contract_details: {
    _id: string;
    symbol: string;
    owner_address: string;
    chain: string;
    type: string;
    transactionhash: string;
    contract_address: string;
    baseuri: string;
    imageuri: [string];
    createdAt: string;
    updatedAt: string;
    collection_name: string;
    description: string;
  };
  nft: {
    _id: string;
    contract_address: string;
    contract_type: string;
    token_id: string;
    meta_data_url: string;
    is_in_auction: string;
    is_in_sale: string;
    token_owner: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
    meta_data: {
      name: string;
      attributes: [object];
      description: string;
      external_uri: string;
      image: string;
    };
  };
}

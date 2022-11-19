export class GetAllNftsResponse {
  totalpages: number;
  currentPage: string;
  nfts: [
    _id: string,
    contract_address: string,
    contract_type: string,
    token_id: number,
    meta_data_url: string,
    is_in_auction: string,
    token_owner: string,
    __v: number,
    updatedAt: string,
    meta_data: {
      name: string;
      image: string;
      description: string;
      external_uri: string;
      attributes: [string];
    },
    createdAt: string,
    is_in_sale: string,
  ];
}

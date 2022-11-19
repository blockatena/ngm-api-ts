export class GetNftsListedResponse {
  [
    _id: string,
    contract_address: string,
    contract_type: string,
    token_id: string,
    meta_data_url: string,
    is_in_auction: boolean,
    is_in_sale: boolean,
    token_owner: string,
    updatedAt: string,
    __v: number,
    meta_data: {
      name: string;
      attributes: [object];
      description: string;
      external_uri: string;
      image: string;
    },
  ];
}

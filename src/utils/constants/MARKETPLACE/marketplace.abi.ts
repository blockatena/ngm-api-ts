export const abi = [
  {
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'ERC20ContractAddress',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'NFTContractAddress',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_buyerAddress',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_tokenId',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '_currentOwnerAddress',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_nftContractOwner',
        type: 'address',
      },
    ],
    name: 'createSale',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_commissionFee',
        type: 'uint256',
      },
    ],
    name: 'setCommissionFees',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

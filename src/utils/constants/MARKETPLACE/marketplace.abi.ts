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
        name: 'contractAddress',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'marketPlaceContractAddress',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'ownerAddress',
        type: 'address',
      },
    ],
    name: 'approvedAll',
    outputs: [
      {
        internalType: 'bool',
        name: 'value',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
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
      {
        internalType: 'uint256',
        name: 'bidAmount',
        type: 'uint256',
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

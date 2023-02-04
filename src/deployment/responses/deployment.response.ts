import mongoose from "mongoose";
class chainType {
    id: number;
    name: string;
}
export class collection {
    _id: mongoose.Types.ObjectId;
    symbol: string;
    owner_address: string;
    collection_name: string;
    chain: chainType;
    type: string;
    transactionhash: string;
    contract_address: string;
    description: string;
    baseuri: string;
    imageuri: [string];
    trade_volume: number;
    createdAt: Date;
    updatedAt: Date;
    __v: number;
}
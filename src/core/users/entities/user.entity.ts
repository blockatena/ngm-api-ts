import { Exclude } from "class-transformer";

export class UserEntity {
    _id: string;
    username: string;
    wallet_address: string;
    email: string;
    createdAt: string;
    updatedAt: string;
    __v: string;
    limit: string;
    constructor(partial: Partial<UserEntity>) {
        Object.assign(this, partial);
    }
}

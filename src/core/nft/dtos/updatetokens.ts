
export class UpdateTokens {
    contract_address: string;
    token_id: number;
    token_owner: string;
    _tokens: number;
    operation: "INCREMENT" | "DECREMENT";
}
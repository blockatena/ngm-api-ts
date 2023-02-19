export class WelcomeMail {
    recepient: {
        email_addr: string,
        user_name: string,
        wallet_address: string,
    };
    subject: string;
    message: string;
}
export class SendApiKey {
    email_addr: string;
    user_name: string;
    wallet_address: string;
    api_key: string;
    subject: string;
}
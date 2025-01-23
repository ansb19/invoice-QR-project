import coolsms from 'coolsms-node-sdk';
import dotenv from 'dotenv';

export class SENDSMS{
    constructor(){
        dotenv.config();
        this.mysms = coolsms.default;
        this.messageService = new this.mysms(process.env.SEND_SNS_API_KEY, process.env.SEND_SNS_API_SECRET);
    }

    async send_sms(phone, text){
        const result = await this.messageService.sendOne({
            to: `${phone}`, //수신자
            from: `${(process.env.SENDER_PHONE)}`, // 발신자
            text: `${text}`
        })
        console.log(result);
    }
}
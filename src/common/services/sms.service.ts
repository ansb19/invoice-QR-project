import { EnvConfig } from "@/config/env.config";
import CoolsmsMessageService from "coolsms-node-sdk";
import { Inject, Service } from "typedi";
import { logger } from "../logging/logger";
import { ValidationError } from "../exceptions/app.error";




@Service()
export class SMSService {
    private messageService: CoolsmsMessageService;

    constructor(@Inject(() => EnvConfig) private readonly config: EnvConfig) {

        try {
            this.messageService = new CoolsmsMessageService(
                this.config.SMS_API_KEY as string,
                this.config.SMS_API_SECRET as string);
            logger.info("SMS service initialized successfully.");
        } catch (error) {
            throw new ValidationError("SMS 서비스 초기화 중 오류 발생", error as Error);
        }

    }

    //기본
    async send_sms(
        sender_phone: string = this.config.SENDER_PHONE,
        receiver_phone: string,
        text: string,
    ): Promise<void> {
        logger.info(`Sending SMS to ${receiver_phone} with text: ${text}`);
        try {
            const result = await this.messageService.sendOne({
                to: `${receiver_phone}`, //수신자
                from: `${sender_phone}`, // 발신자
                text: `${text}`,
                autoTypeDetect: false,
                type: 'SMS'
            })
            logger.info(`SMS sent successfully to ${receiver_phone}: ${JSON.stringify(result)}`);
        } catch (error) {
            throw new ValidationError("SMS 전송 중 오류 발생", error as Error);
        }

    }
}
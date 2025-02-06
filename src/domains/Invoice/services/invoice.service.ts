import { Inject, Service } from "typedi";
import { QR_CodeRepository } from "../repository/qr_code.repository";
import { InvoiceRepository } from "../repository/invoice.repository";
import { DeliveryItemRepository } from "../repository/delivery_item.repository";
import { EnvConfig } from "@/config/env.config";
import { Invoice, Item } from "../entities/invoice.entity";
import { TransactionManager } from "@/config/database/transaction_manager";
import { Address } from "@/domains/user/entities/address.entity";
import { AppError, DatabaseError, ForbiddenError, NotFoundError, ValidationError } from "@/common/exceptions/app.error";
import { toDataURL } from "qrcode";
import { SMSService } from "@/common/services/sms.service";
import { Delivery_Driver, Delivery_Status, Invoice_User, Routers } from "@/common/utils/enum.control";
import { SocialUserRepository } from "@/domains/user/repository/social_user.repository";


@Service()
export class InvoiceService {
    constructor(
        @Inject(() => QR_CodeRepository) private qr_code: QR_CodeRepository,
        @Inject(() => InvoiceRepository) private invoice: InvoiceRepository,
        @Inject(() => DeliveryItemRepository) private delivery_item: DeliveryItemRepository,
        @Inject(() => EnvConfig) private config: EnvConfig,
        @Inject(() => TransactionManager) private transactionmanager: TransactionManager,
        @Inject(() => SMSService) private sms: SMSService,
        @Inject(() => SocialUserRepository) private user: SocialUserRepository,
    ) {

    }

    public async create_invoice(

        invoice_data: Partial<Invoice>,
    ): Promise<Invoice> {
        //송장, 딜리버리, 아이템
        try {
            const result = await this.transactionmanager.execute(async (queryRunner) => {

                const new_invoice = await this.invoice.create({
                    ...invoice_data,
                }, queryRunner)

                await Promise.all(
                    invoice_data.items!.map(async (item) => {
                        await this.delivery_item.create({
                            ...item,
                            invoice: new_invoice,
                        }, queryRunner)
                    })
                )

                const url = `${this.config.FRONT_END_API}${Routers.invoice}/${new_invoice.id}`
                const qr_code_url = await toDataURL(url);

                await this.qr_code.create({
                    url: url,
                    qr_code_url: qr_code_url,
                })

                return new_invoice;
            })

            return result;
        } catch (error) {
            throw error instanceof AppError
                ? error
                : new DatabaseError("송장 생성 중 오류 발생", error as Error);
        }


    }

    public async delete_invoice(id: number): Promise<boolean> {
        //배달기사 배치 전이면 가능

        const find_invoice = await this.invoice.read_one({ id: id });

        if (!find_invoice)
            throw new NotFoundError("송장을 찾지 못해 삭제할 수 없습니다");


        if (find_invoice.delivery_status === Delivery_Status.CHARGE)
            return await this.invoice.delete({ id: id });

        else {
            throw new ForbiddenError("이미 진행되어서 삭제할 수 없습니다");
        }

    }

    public async change_delivery_status(id: number, data: Partial<Invoice>): Promise<Invoice> {

        let text: string;
        let update_invoice: Invoice;
        switch (data.delivery_status) {
            case Delivery_Status.PREPARE:
                update_invoice = await this.invoice.update({ id: id }, { delivery_status: data.delivery_status })
                break;

            case Delivery_Status.BATCH:

                update_invoice = await this.invoice.update({ id: id }, {
                    ...data
                })

                text =
                    `ㅇㅇ택배 배달기사 ${update_invoice.delivery_driver_name} 입니다.
         '수령인 ${update_invoice.receiver_name}님 곧 배달이 시작됩니다.
         보내는분 ${update_invoice.sender_name}
         물품 ${update_invoice.items}
        송장번호 ${update_invoice.id}
        배송장소 ${update_invoice.receiver_address}`;

                await this.sms.send_sms(
                    update_invoice.delivery_driver_phone,
                    update_invoice.receiver_phone,
                    text,
                );
                break;

            case Delivery_Status.START:
                update_invoice = await this.invoice.update({ id: id }, { delivery_status: data.delivery_status })
                break;

            case Delivery_Status.DOING:
                update_invoice = await this.invoice.update({ id: id }, { delivery_status: data.delivery_status })
                break;

            case Delivery_Status.COMPLETE:
                update_invoice = await this.invoice.update({ id: id }, { delivery_status: data.delivery_status })

                text =
                    `ㅇㅇ택배 배달기사 ${update_invoice.delivery_driver_name} 입니다.
     '수령인 ${update_invoice.receiver_name}님 배달이 완료되었습니다.
     보내는분 ${update_invoice.sender_name}
     물품 ${update_invoice.items}
    송장번호 ${update_invoice.id}`;

                await this.sms.send_sms(
                    update_invoice.delivery_driver_phone,
                    update_invoice.receiver_phone,
                    text,
                );

                break;

            case Delivery_Status.CHARGE: // 상태를 오히려 뒤로 갈때만 씀
                update_invoice = await this.invoice.update({ id: id }, { delivery_status: data.delivery_status })
                break;

            default:
                throw new NotFoundError("해당 배달 상태를 찾을 수 없습니다");
        }
        return update_invoice;
    }

    public async print_qr_code() {
        //이건 프론트가
    }

    public async find_invoices(user_id: number, user_type: Invoice_User): Promise<Invoice[]> {
        // 배달기사,보내는사람,받는사람
        try {
            const result = await this.transactionmanager.execute(async (queryRunner) => {
                const find_user = await this.user.read_one({ id: user_id });

                if (!find_user)
                    throw new NotFoundError("송장 조회 중 유저를 찾을 수 없습니다");

                switch (user_type) {
                    case Invoice_User.DEIVERY:
                        return await this.invoice.read_all({ delivery_driver_phone: find_user.phone }, undefined, queryRunner)

                    case Invoice_User.SENDER:
                        return await this.invoice.read_all({ sender_phone: find_user.phone }, undefined, queryRunner)

                    case Invoice_User.RECEIVER:
                        return await this.invoice.read_all({ receiver_phone: find_user.phone }, undefined, queryRunner)
                    default:
                        throw new ValidationError("유저 타입이 맞지 않습니다!!");
                }
            })
            return result;

        } catch (error) {
            throw error instanceof (NotFoundError || ValidationError)
                ? error
                : new DatabaseError("유저별 송장 조회 중 오류 발생");
        }


    }


    //로그인한 사용자는 전부 봄
    //로그인 하지 않은 사용자는 제한된 정보 **동 *로 이런식으로 봄.
}
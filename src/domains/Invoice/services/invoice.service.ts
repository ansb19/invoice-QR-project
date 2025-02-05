import { Inject, Service } from "typedi";
import { QR_CodeRepository } from "../repository/qr_code.repository";
import { InvoiceRepository } from "../repository/invoice.repository";
import { DeliveryItemRepository } from "../repository/delivery_item.repository";
import { EnvConfig } from "@/config/env.config";
import { Invoice, Item } from "../entities/invoice.entity";
import { TransactionManager } from "@/config/database/transaction_manager";
import { Address } from "@/domains/user/entities/address.entity";
import { AppError, DatabaseError, ForbiddenError, NotFoundError } from "@/common/exceptions/app.error";
import { toDataURL } from "qrcode";
import { SMSService } from "@/common/services/sms.service";
import { Delivery_Driver, Delivery_Status, Routers } from "@/common/utils/enum.control";


@Service()
export class InvoiceService {
    constructor(
        @Inject(() => QR_CodeRepository) private qr_code: QR_CodeRepository,
        @Inject(() => InvoiceRepository) private invoice: InvoiceRepository,
        @Inject(() => DeliveryItemRepository) private delivery_item: DeliveryItemRepository,
        @Inject(() => EnvConfig) private config: EnvConfig,
        @Inject(() => TransactionManager) private transactionmanager: TransactionManager,
        @Inject(() => SMSService) private sms: SMSService,
    ) {

    }

    public async create_invoice(
        r_address: Partial<Address>,
        s_address: Partial<Address>,
        invoice_data: Partial<Invoice>,
        delivery_items_data: Partial<Item[]>): Promise<Invoice> {
        //송장, 딜리버리, 아이템
        try {
            const receiver_name = r_address.name;
            const receiver_phone = r_address.receiver_phone_number1;
            const receiver_address =
                `${r_address.base_address} ${r_address.detail_address} ${r_address.zone_number}${r_address.zip_code}`;

            const sender_name = s_address.name;
            const sender_phone = s_address.receiver_phone_number1;
            const sender_address =
                `${s_address.base_address} ${s_address.detail_address} ${s_address.zone_number}${s_address.zip_code}`


            const result = await this.transactionmanager.execute(async (queryRunner) => {

                const new_invoice = await this.invoice.create({
                    ...invoice_data,
                    sender_name: sender_name,
                    sender_phone: sender_phone,
                    sender_address: sender_address,
                    receiver_name: receiver_name,
                    receiver_phone: receiver_phone,
                    receiver_address: receiver_address,
                    delivery_status: Delivery_Status.CHARGE,
                }, queryRunner)

                await Promise.all(
                    delivery_items_data.map(async (item) => {
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

    public async change_delivery_status(id: number, status: Delivery_Status, driver?: Delivery_Driver): Promise<void> {

        let text: string;
        let update_invoice: Invoice;
        switch (status) {
            case Delivery_Status.PREPARE:
                await this.invoice.update({ id: id }, { delivery_status: status })
                break;

            case Delivery_Status.BATCH:

                update_invoice = await this.invoice.update({ id: id }, {
                    ...driver,
                    delivery_status: status,
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
                await this.invoice.update({ id: id }, { delivery_status: status })
                break;

            case Delivery_Status.DOING:
                await this.invoice.update({ id: id }, { delivery_status: status })
                break;

            case Delivery_Status.COMPLETE:
                update_invoice = await this.invoice.update({ id: id }, { delivery_status: status })

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
                await this.invoice.update({ id: id }, { delivery_status: status })
                break;
        }
    }

    public async print_qr_code(){
        //이건 프론트가
    }

    

    //로그인한 사용자는 전부 봄
    //로그인 하지 않은 사용자는 제한된 정보 **동 *로 이런식으로 봄.
}
import { Charge_Type, Delivery_Driver, Delivery_Status } from "@/common/utils/enum.control";
import { DeliveryItem } from "../entities/delivery_item.entity";
import { Invoice } from "../entities/invoice.entity";
import { QR_Code } from "../entities/qr_code.entity";
import { Address } from "@/domains/user/entities/address.entity";
import { Transform } from "class-transformer";

export class CreateInvoiceDTO {

    message?: string;

    charge_type!: Charge_Type;

    items!: DeliveryItem[];

    sender_name!: string;
    sender_phone!: string;
    origin_sender_address!: Partial<Address>;
    @Transform(({ obj }) =>
        `${obj.origin_sender_address?.base_address ?? ''} ${obj.origin_sender_address?.detail_address ?? ''} ${obj.origin_sender_address?.zone_number ?? ''} ${obj.origin_sender_address?.zip_code ?? ''}`.trim()
    )
    sender_address?: string;

    receiver_name!: string;
    receiver_phone!: string;

    origin_receiver_address!: Partial<Address>;
    @Transform(({ obj }) =>
        `${obj.origin_receiver_address?.base_address ?? ''} ${obj.origin_receiver_address?.detail_address ?? ''} ${obj.origin_receiver_address?.zone_number ?? ''} ${obj.origin_receiver_address?.zip_code ?? ''}`.trim()
    )
    receiver_address?: string;

    delivery_status: Delivery_Status = Delivery_Status.CHARGE;
}

export class UpdateInvoiceDTO {

    message?: string;
    charge_type?: Charge_Type;
    items?: DeliveryItem[];
    sender_name?: string;
    sender_phone?: string;
    origin_sender_address!: Partial<Address>;
    @Transform(({ obj }) =>
        `${obj.origin_sender_address?.base_address ?? ''} ${obj.origin_sender_address?.detail_address ?? ''} ${obj.origin_sender_address?.zone_number ?? ''} ${obj.origin_sender_address?.zip_code ?? ''}`.trim()
    )
    sender_address?: string;
    receiver_name?: string;
    receiver_phone?: string;
    origin_receiver_address!: Partial<Address>;
    @Transform(({ obj }) =>
        `${obj.origin_receiver_address?.base_address ?? ''} ${obj.origin_receiver_address?.detail_address ?? ''} ${obj.origin_receiver_address?.zone_number ?? ''} ${obj.origin_receiver_address?.zip_code ?? ''}`.trim()
    )
    receiver_address?: string;
    delivery_driver_name?: Partial<Delivery_Driver>;
    delivery_driver_phone?: Partial<Delivery_Driver>;
    delivery_status?: Delivery_Status;

}

export class ResponseInvoiceDTO {

    id: number;
    created_at: Date;
    message?: string;
    charge_type: Charge_Type;
    items: DeliveryItem[];
    sender_name: string;
    sender_phone: string;
    sender_address: string;
    receiver_name: string;
    receiver_phone: string;
    receiver_address: string;
    delivery_driver_name?: string;
    delivery_driver_phone?: string;
    delivery_status: Delivery_Status;
    delivery_status_at?: Date;
    qr_code: QR_Code;
    constructor(entity: Invoice) {
        this.id = entity.id;
        this.created_at = entity.created_at;
        this.message = entity.message;
        this.charge_type = entity.charge_type;
        this.items = entity.items;
        this.sender_name = entity.sender_name;
        this.sender_phone = entity.sender_phone;
        this.sender_address = entity.sender_address;
        this.receiver_name = entity.receiver_name;
        this.receiver_phone = entity.receiver_phone;
        this.receiver_address = entity.receiver_address;
        this.delivery_driver_name = entity.delivery_driver_name;
        this.delivery_driver_phone = entity.delivery_driver_phone;
        this.delivery_status = entity.delivery_status;
        this.delivery_status_at = entity.delivery_status_at;
        this.qr_code = entity.qr_code;

    }
}
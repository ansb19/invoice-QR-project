import { Column, CreateDateColumn, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { DeliveryItem } from "./delivery_item.entity";
import { QR_Code } from "./qr_code.entity";

export interface Item {
    name: string;
    count: number;
    type: string;
}

@Entity('INVOICE')
export class Invoice {
    @PrimaryGeneratedColumn({ type: "bigint" })
    id!: number; // 운송장 번호

    @CreateDateColumn({ type: 'timestamp', default: () => "timezone('Asia/Seoul', now())" })
    created_at!: Date; // 송장 생성 날짜

    @Column({ type: "varchar" })
    message?: string; // 메세지

    @Column({ type: "varchar", length: 10 })
    charge_type!: string; // 착불, 선불

    @OneToMany( () => DeliveryItem, (item) => item.invoice, {cascade: ['insert','update', 'remove', 'soft-remove', 'recover'], eager: true})
    items!: DeliveryItem[];

    // 보내는 사람 정보 (독립 저장)
    @Column({ type: 'varchar' })
    sender_name!: string;

    @Column({ type: 'varchar' })
    sender_phone!: string;

    @Column({ type: 'varchar' })
    sender_address!: string;

    // 받는 사람 정보 (독립 저장)
    @Column({ type: 'varchar' })
    receiver_name!: string;

    @Column({ type: 'varchar' })
    receiver_phone!: string;

    @Column({ type: 'varchar' })
    receiver_address!: string;

    @Column({ type: 'varchar'})
    delivery_driver_name?: string;

    @Column({ type: 'varchar'})
    delivery_driver_phone?: string;

    @Column({type: "varchar"})
    delivery_status!: string; //배달 상태 (배달 준비, 배달 중 )

    @OneToOne(() => QR_Code, (qrcode) => qrcode.invoice, { cascade: ['insert','update', 'remove', 'soft-remove', 'recover'], eager: true})
    qr_code!: QR_Code;
}
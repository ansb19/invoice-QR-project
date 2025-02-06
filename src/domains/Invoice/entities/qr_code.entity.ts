import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Invoice } from "./invoice.entity";

@Entity('QR_CODE')
export class QR_Code {
    @PrimaryGeneratedColumn({ type: "bigint" })
    id!: number;

    @Column({ type: 'varchar' })
    url!: string;

    @Column({ type: 'varchar' })
    qr_code_url!: string;

    @OneToOne(() => Invoice, (invoice) => invoice.qr_code, { onDelete: 'CASCADE'})
    @JoinColumn({ name: 'invoice_id', referencedColumnName: 'id' })
    invoice!: Invoice;

}
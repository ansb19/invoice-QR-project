import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Invoice } from "./invoice.entity";


@Entity("DELIVERY_ITEM")
export class DeliveryItem {
    @PrimaryGeneratedColumn({ type: "bigint" })
    id!: number;

    @Column({ type: 'varchar'})
    name!: string;

    @Column({ type: "int" })
    count!: number;

    @Column({ type: 'varchar' })
    type!: string;

    @ManyToOne(() => Invoice, (invoice) => invoice.items, { onDelete: "CASCADE"})
    @JoinColumn({ name: 'id' })
    invoice!: Invoice;
}
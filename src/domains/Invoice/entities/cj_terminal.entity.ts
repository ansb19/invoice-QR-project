import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index(['name', 'address'])
@Entity("CJ_TERMINAL")
export class CJ_Terminal {
    @PrimaryGeneratedColumn({ type: "bigint" })
    id!: number;

    @Column({ type: 'varchar' })
    name!: string;

    @Column({ type: 'varchar' })
    address!: string;
}
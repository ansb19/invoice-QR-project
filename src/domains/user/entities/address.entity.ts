import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { SocialUser } from "./social_user.entity";

@Entity('ADDRESS')
export class Address {
    @PrimaryGeneratedColumn({ type: "bigint" })
    id!: number;

    @Column({ type: 'varchar', nullable: true })
    provider_address_id?: string; //카카오 아이디

    @Column({ type: 'varchar', length: 50 })
    name!: string; // 주소 이름 (예: 회사, 집 등)

    @Column({ type: 'boolean', default: false })
    is_default!: boolean; // 기본 배송지 여부

    @Column({ type: 'varchar', length: 255 })
    base_address!: string; // 기본 주소

    @Column({ type: 'varchar', length: 255, nullable: true })
    detail_address?: string; // 상세 주소

    @Column({ type: 'varchar', length: 50 })
    receiver_name!: string; // 수신인 이름

    @Column({ type: 'varchar', length: 20 })
    receiver_phone_number1!: string; // 수신인 연락처 1

    @Column({ type: 'varchar', length: 20, nullable: true })
    receiver_phone_number2?: string; // 수신인 연락처 2 (옵션)

    @Column({ type: 'varchar', length: 10, nullable: true })
    zone_number?: string; // 지역 번호

    @Column({ type: 'varchar', length: 10, nullable: true })
    zip_code?: string; // 우편번호

    @ManyToOne(() => SocialUser, (user) => user.Addresses, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user!: SocialUser; // SocialUser와의 관계 설정

    @CreateDateColumn({ type: 'timestamp', default: () => "timezone('Asia/Seoul', now())" })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => "timezone('Asia/Seoul', now())", onUpdate: "CURRENT_TIMESTAMP" })
    updated_at!: Date;
}

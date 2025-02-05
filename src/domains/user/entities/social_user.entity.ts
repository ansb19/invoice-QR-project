import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Address } from "./address.entity";


@Entity('SOCIAL_USER')
export class SocialUser {
    @PrimaryGeneratedColumn({ type: "bigint" })
    id!: number;

    @Column({ type: 'varchar' })
    provider_user_id!: string; // 소셜 제공자가 부여한 고유 사용자 ID

    @Column({ type: "varchar", length: 100 })
    provider_type!: string;  // 예: "kakao", "google", "apple"

    @Column({ type: 'varchar' })
    profile_nickname!: string;

    @Column({ type: 'varchar' })
    profile_image!: string;

    @Column({ type: 'varchar' })
    account_email!: string;

    @Column({ type: 'varchar' })
    phone!: string;

    @Column({ type: "varchar", length: 300 })
    refresh_token!: string;

    @Column({ type: "timestamp" })
    refresh_token_expires_at!: Date;

    @CreateDateColumn({ type: 'timestamp', default: () => "timezone('Asia/Seoul', now())" })
    created_at!: Date;

    @OneToMany(() => Address, (address) => address.user, { cascade: ['insert','update', 'remove', 'soft-remove', 'recover'], eager: true })
    Addresses?: Address[];
}

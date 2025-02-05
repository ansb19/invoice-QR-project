import { BaseRepository } from "@/common/abstract/base.repository";
import { Inject, Service } from "typedi";
import { Database } from "@/config/database/Database";
import { SocialUser } from "../entities/social_user.entity";
import { DeepPartial, QueryRunner } from "typeorm";

@Service()
export class SocialUserRepository extends BaseRepository<SocialUser> {
    constructor(@Inject(() => Database) readonly database: Database) {
        super(SocialUser, database);
    }

    public async find_one_by_provider(provider_type: string, provider_user_id: string, queryRunner?: QueryRunner): Promise<SocialUser | null> {
        const find_social_user = await this.read_one({ provider_type, provider_user_id }, undefined, queryRunner);
        return find_social_user;

    }
}
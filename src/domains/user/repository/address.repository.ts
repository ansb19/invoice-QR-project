import { BaseRepository } from "@/common/abstract/base.repository";
import { Inject, Service } from "typedi";
import { Address } from "../entities/address.entity";
import { Database } from "@/config/database/Database";
import { QueryRunner } from "typeorm";


@Service()
export class AddressRepository extends BaseRepository<Address> {
    constructor(@Inject(() => Database) readonly database: Database) {
        super(Address, database);
    }

    public async addresses_list(user_id: number, queryRunner?: QueryRunner): Promise<Address[]> {

        const find_addresses = await this.getRepository(queryRunner).find({
            where: { user: { id: user_id } }
        })

        return find_addresses;
    }

    public async find_similar_address(user_id: number, receiver_name: string, queryRunner?: QueryRunner): Promise<Address[]> {

        const find_addresses = await this.getRepository(queryRunner)
            .createQueryBuilder('address')
            .where("address.user_id = :user_id", { user_id })
            .andWhere("address.receiver_name ILIKE :receiver_name", { receiver_name: `${receiver_name}%` })
            .getMany();

        return find_addresses;
    }
}

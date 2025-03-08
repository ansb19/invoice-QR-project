import { Inject, Service } from "typedi";
import { AddressRepository } from "../repository/address.repository";
import { Address } from "../entities/address.entity";
import { NotFoundError } from "@/common/exceptions/app.error";



@Service()
export class AddressService {
    constructor(
        @Inject(() => AddressRepository) private address: AddressRepository,
    ) {

    }

    public async create_address(data: Partial<Address>): Promise<Address> {

        const new_address = await this.address.create(data);

        return new_address;
    }

    public async update_address(id: number, data: Partial<Address>): Promise<Address> {

        const update_address = await this.address.update({ id: id }, data);

        return update_address;
    }

    public async read_addresses_list(user_id: number): Promise<Address[]> { //리스트

        const find_addresses = await this.address.addresses_list(user_id);
        return find_addresses;
    }

    public async read_one_address(id: number): Promise<Address> {

        const find_one_address = await this.address.read_one({ id: id });

        if (!find_one_address)
            throw new NotFoundError("주소를 찾을 수 없습니다");

        return find_one_address;
    }

    public async delete_address(id: number): Promise<boolean> {

        const is_delete_address = await this.address.delete({ id: id });

        return is_delete_address;
    }

    public async find_similar_address(user_id: number, partial_receiver_name: string): Promise<Address[]> {

        const addresses = await this.find_similar_address(user_id, partial_receiver_name);

        return addresses;

    }
}

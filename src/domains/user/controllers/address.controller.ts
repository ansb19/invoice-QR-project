import { Body, Delete, Get, HttpCode, JsonController, Param, Patch, Post, Put } from "routing-controllers";
import { Inject, Service } from "typedi";
import { AddressService } from "../services/address.service";
import { Address } from "../entities/address.entity";
import { CreateAddressDTO, ResponseAddressDTO, UpdateAddressDTO } from "../dtos/address.dto";
import { plainToInstance } from 'class-transformer';


@Service()
@JsonController("/address")
export class AddressController {
    constructor(@Inject(() => AddressService) private address: AddressService) {

    }

    @Post()
    @HttpCode(201)
    public async create_address(@Body() address: CreateAddressDTO) {

        const entity: Partial<Address> = plainToInstance(Address, address);

        const new_address = await this.address.create_address(entity);

        const response_address = new ResponseAddressDTO(new_address);
        return {
            message: "주소 생성 성공",
            data: response_address,
        }
    }

    @Patch('/:id')
    @HttpCode(200)
    public async update_address(@Body() address: UpdateAddressDTO, @Param('id') id: number) {

        const entity: Partial<Address> = plainToInstance(Address, address);

        const update_address = await this.address.update_address(id, entity);

        const response_address = new ResponseAddressDTO(update_address);
        return {
            message: "주소 변경 성공",
            data: response_address,
        }
    }

    @Get('/:user_id')
    @HttpCode(200)
    public async read_addresses_list(@Param('user_id') user_id: number) {

        const find_addresses = await this.address.read_addresses_list(user_id);

        const response_addresses = find_addresses.map((address) => new ResponseAddressDTO(address))

        return {
            message: "주소 리스트 조회 성공",
            data: response_addresses,
        }
    }

    @Get('/:id')
    @HttpCode(200)
    public async read_address(@Param('id') id: number) {

        const find_address = await this.address.read_one_address(id);

        const response_address = new ResponseAddressDTO(find_address);

        return {
            message: "주소 조회 성공",
            data: response_address,
        }
    }

    @Delete('/:id')
    @HttpCode(200)
    public async delete_address(@Param('id') id: number) {

        const is_delete_address = await this.address.delete_address(id);

        return {
            message: "주소 삭제 성공",
            data: is_delete_address,
        }
    }
}
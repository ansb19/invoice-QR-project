import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsPhoneNumber, IsString, Length } from 'class-validator';
import { Address } from '../entities/address.entity';

export class CreateAddressDTO {

    @IsString()
    @IsNotEmpty()
    @Length(1, 50)
    name!: string;

    @IsBoolean()
    is_default!: boolean;

    @IsString()
    @IsNotEmpty()
    @Length(1, 255)
    base_address!: string;

    @IsString()
    @IsOptional()
    @Length(1, 255)
    detail_address?: string;

    @IsString()
    @IsNotEmpty()
    @Length(1, 50)
    receiver_name!: string; // 수신인 이름

    @IsString()
    @IsPhoneNumber('KR', { message: "유효한 한국 전화번호를 입력하세요." })
    @Length(1, 20)
    @IsNotEmpty()
    receiver_phone_number1!: string; // 수신인 연락처 1

    @IsString()
    @IsPhoneNumber('KR')
    @Length(1, 20)
    @IsOptional()
    receiver_phone_number2?: string; // 수신인 연락처 2 (옵션)

    @IsOptional()
    @IsString()
    @Length(1, 10)
    zone_number?: string; // 지역 번호

    @IsOptional()
    @IsString()
    @Length(1, 10)
    zip_code?: string; // 우편번호

    @IsNumber()
    @IsNotEmpty()
    user_id!: number;
}

export class UpdateAddressDTO {

    @IsString()
    @IsOptional()
    @Length(1, 50)
    name?: string;

    @IsBoolean()
    @IsOptional()
    is_default?: boolean;

    @IsString()
    @IsOptional()
    @Length(1, 255)
    base_address?: string;

    @IsString()
    @IsOptional()
    @Length(1, 255)
    detail_address?: string;

    @IsString()
    @IsOptional()
    @Length(1, 50)
    receiver_name?: string; // 수신인 이름

    @IsString()
    @IsPhoneNumber('KR', { message: "유효한 한국 전화번호를 입력하세요." })
    @Length(1, 20)
    @IsOptional()
    receiver_phone_number1?: string; // 수신인 연락처 1

    @IsString()
    @IsPhoneNumber('KR')
    @Length(1, 20)
    @IsOptional()
    receiver_phone_number2?: string; // 수신인 연락처 2 (옵션)

    @IsOptional()
    @IsString()
    @Length(1, 10)
    zone_number?: string; // 지역 번호

    @IsOptional()
    @IsString()
    @Length(1, 10)
    zip_code?: string; // 우편번호

}

export class ResponseAddressDTO {

    id: number;
    name: string;
    is_default: boolean;
    base_address: string;
    detail_address?: string;
    receiver_name: string;
    receiver_phone_number1: string;
    receiver_phone_number2?: string;
    zone_number?: string;
    zip_code?: string;

    constructor(entity: Address) {
        this.id = entity.id;
        this.name = entity.name;
        this.is_default = entity.is_default;
        this.base_address = entity.base_address;
        this.detail_address = entity.detail_address;
        this.receiver_name = entity.receiver_name;
        this.receiver_phone_number1 = entity.receiver_phone_number1;
        this.receiver_phone_number2 = entity.receiver_phone_number2;
        this.zone_number = entity.zone_number;
        this.zip_code = entity.zip_code;
    }
}
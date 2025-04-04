import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsPhoneNumber, IsString, Length } from 'class-validator';
import { Expose } from 'class-transformer';

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

    @Expose()
    id!: number;
    @Expose()
    name!: string;
    @Expose()
    is_default!: boolean;
    @Expose()
    base_address!: string;
    @Expose()
    detail_address?: string;
    @Expose()
    receiver_name!: string;
    @Expose()
    receiver_phone_number1!: string;
    @Expose()
    receiver_phone_number2?: string;
    @Expose()
    zone_number?: string;
    @Expose()
    zip_code?: string;

    
}
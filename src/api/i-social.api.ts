export interface Token {
    access_token: string,
    refresh_token: string,
    expires_in: number,
    refresh_token_expires_in: number,
}

export interface SoicalUser {
    id: string; //소셜 서비스에서 제공하는 고유 ID -> provider_user_id
    email?: string; // 이메일 (선택 제공)
    nickname: string; // 닉네임 또는 이름
    profileImage?: string; //url s3
    phone: string;
}

export interface Address{
    provider_address_id: string;
    name: string;
    is_default: boolean;
    base_address: string;
    detail_address?: string;
    receiver_name: string;
    receiver_phone_number1: string;
    receiver_phone_number2?: string;
    zone_number: string; 
    zip_code: string;
}


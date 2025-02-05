//import { IsBoolean, IsEmail, IsNumber, IsOptional, IsPhoneNumber, IsString, IsStrongPassword, IsUrl, Length, Max, Min } from "class-validator";
// 이미 카카오 api에서 검증 된 것을 가져오기 때문에 검증하는 로직

import { SocialUser } from "../entities/social_user.entity";

export class ResponseSocialUserDTO {
    id!: number;
    profile_nickname!: string;
    profile_image!: string;
    account_email!: string;
    phone!: string;

    constructor(entity: SocialUser) {
        this.id = entity.id;
        this.profile_nickname = entity.profile_nickname;
        this.profile_image = entity.profile_image;
        this.account_email = entity.account_email;
        this.phone = entity.phone;
    }
}
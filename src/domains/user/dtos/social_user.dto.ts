//import { IsBoolean, IsEmail, IsNumber, IsOptional, IsPhoneNumber, IsString, IsStrongPassword, IsUrl, Length, Max, Min } from "class-validator";
// 이미 카카오 api에서 검증 된 것을 가져오기 때문에 검증하는 로직

import { Expose, Transform } from "class-transformer";
import { SocialUser } from "../entities/social_user.entity";

export class ResponseSocialUserDTO {
    
    @Expose()
    id!: number;
    @Expose()
    profile_nickname!: string;
    @Expose()
    profile_image!: string;
    @Expose()
    account_email!: string;
    @Expose()
    phone!: string;

}
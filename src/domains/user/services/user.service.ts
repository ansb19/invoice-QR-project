import { Inject, Service } from "typedi";
import { SocialUserRepository } from "../repository/social_user.repository";
import { KakaoLoginApi } from "@/api/kakao.login.api";
import { TransactionManager } from "@/config/database/transaction_manager";
import { AddDate, formatPhoneNumber } from "@/common/utils/formatter";
import { SocialUser } from "../entities/social_user.entity";
import { AppError, DatabaseError, NotFoundError, ValidationError } from "@/common/exceptions/app.error";
import { UserType } from "@/common/utils/enum.control";
import { logger } from "@/common/logging/logger";
import { AddressRepository } from "../repository/address.repository";

@Service()
export class UserService {
    constructor(
        @Inject(() => SocialUserRepository) private SocialUserRepository: SocialUserRepository,
        @Inject(() => KakaoLoginApi) private kakaoapi: KakaoLoginApi,
        @Inject(() => TransactionManager) private transactionManager: TransactionManager,
        @Inject(() => AddressRepository) private addressRepository: AddressRepository,

    ) {

    }

    public kakao_signup_url(front_redirect_url:string, backend_redirect_url?: string): string {
        const url = this.kakaoapi.get_url(front_redirect_url, backend_redirect_url);
        return url;
    }

    public async kakao_signup(code: string, redirect_url?: string): Promise<SocialUser> {
        try {

            const data = await this.kakaoapi.request_token(code, redirect_url);

            const kakao_user_info = await this.kakaoapi.request_user_info(data.access_token);


            const result = await this.transactionManager.execute(async (queryRunner) => {

                const existing_kakao_user = await this.SocialUserRepository.find_one_by_provider(UserType.KAKAO, kakao_user_info.id, queryRunner);

                if (existing_kakao_user) {
                    const login_user = await this.SocialUserRepository.update({ id: existing_kakao_user.id }, {
                        profile_nickname: kakao_user_info.nickname,
                        profile_image: kakao_user_info.profileImage,
                        account_email: kakao_user_info.email,
                        phone: kakao_user_info.phone,
                        refresh_token: data.refresh_token,
                        refresh_token_expires_at: AddDate(new Date(), 0, 0, 0, 0, data.refresh_token_expires_in),
                    }, queryRunner)
                    return login_user;
                }

                else {
                    const new_kakao_user = await this.SocialUserRepository.create(
                        {
                            provider_user_id: kakao_user_info.id,
                            provider_type: UserType.KAKAO,
                            profile_nickname: kakao_user_info.nickname,
                            profile_image: kakao_user_info.profileImage,
                            account_email: kakao_user_info.email,
                            phone: kakao_user_info.phone,
                            refresh_token: data.refresh_token,
                            refresh_token_expires_at: AddDate(new Date(), 0, 0, 0, 0, data.refresh_token_expires_in),
                        }, queryRunner
                    )

                    const new_kakao_addresses = await this.kakaoapi.request_shipping_address(data.access_token);

                    await Promise.all(
                        new_kakao_addresses.map(async (address) => {
                            await this.addressRepository.create({
                                ...address,
                                user: new_kakao_user,
                            }, queryRunner);

                        })
                    )

                    return new_kakao_user;
                }
            })

            return result;

        } catch (error) {
            if (error instanceof AppError)
                throw error;
            else
                throw new DatabaseError("카카오 회원가입 및 로그인 중 오류 발생", error as Error);
        }
    }

    public async kakao_refresh_token(kakao_user: SocialUser): Promise<SocialUser> {
        try {
            const target_date = AddDate(new Date(), 1);
            const stored_date = kakao_user.refresh_token_expires_at;

            // 카카오 리프레쉬 토큰 관리 ( 1달 미만이면 갱신)
            if (target_date > stored_date) {
                const data = await this.kakaoapi.refresh_token(kakao_user.refresh_token);

                const login_user = await this.SocialUserRepository.update({ id: kakao_user.id }, {
                    refresh_token: data.refresh_token,
                    refresh_token_expires_at: AddDate(new Date(), 0, 0, 0, 0, data.refresh_token_expires_in)
                });
                return login_user;
            }
            else {
                return kakao_user;
            }
        } catch (error) {
            throw new ValidationError("카카오 로그인 중 오류 발생", error as Error);
        }
    }

    public async auto_kakao_refresh_token(): Promise<void> {
        const all_users = await this.SocialUserRepository.read_all();

        const target_date = AddDate(new Date(), 1);

        const expiring_users = all_users.filter(
            user => new Date(user.refresh_token_expires_at) <= target_date
        );

        // 병렬로 갱신 처리
        const results = await Promise.allSettled(
            expiring_users.map(user =>
                this.kakao_refresh_token(user)
            )
        )

        // 결과 로그
        const succeeded = results.filter(result => result.status === "fulfilled").length;
        const failed = results.filter(result => result.status === "rejected").length;

        logger.info(`Token refresh completed: ${succeeded} users succeeded`);
        if (failed > 0) {
            logger.warn(`Token refresh failed: ${failed} users failed`);
        }
    }

    public async kakao_logout(id: number): Promise<void> {
        try {
            const find_social_user = await this.SocialUserRepository.read_one({ id: id });

            if (!find_social_user)
                throw new NotFoundError(`해당 소셜 유저가 없습니다.`);

            const data = await this.kakaoapi.refresh_token(find_social_user.refresh_token);

            await this.kakaoapi.logout(data.access_token);

        } catch (error) {
            throw error instanceof NotFoundError
                ? error
                : new ValidationError(`Social logout process failed: ${(error as Error).message}`, error as Error);
        }
    }

    public async kakao_withdrawal(id: number): Promise<void> {
        try {
            const find_social_user = await this.SocialUserRepository.read_one({ id: id });
            if (!find_social_user)
                throw new NotFoundError(`해당 소셜 유저가 없습니다.`);

            await this.SocialUserRepository.delete({ id: id });

            const data = await this.kakaoapi.refresh_token(find_social_user.refresh_token);
            await this.kakaoapi.unlink(data.access_token);

        } catch (error) {
            throw error instanceof NotFoundError
                ? error
                : new ValidationError(`Social withdrwal process failed: ${(error as Error).message}`, error as Error);
        }
    }

    public async find_profile(id: number): Promise<SocialUser> {
        try {
            const find_user = await this.SocialUserRepository.read_one({ id: id });
            if (!find_user)
                throw new NotFoundError(`해당 소셜 유저가 없습니다.`);
            return find_user;
        } catch (error) {
            throw new DatabaseError("프로필 조회 중 오류 발생");
        }
    }
}
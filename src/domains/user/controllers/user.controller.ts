import { Get, HttpCode, JsonController, Param, Params, Post, QueryParam, Req, Res, Session, SessionParam } from "routing-controllers";
import Container, { Inject, Service } from "typedi";
import { UserService } from "../services/user.service";
import { Request, Response } from 'express';
import { ValidationError } from "@/common/exceptions/app.error";
import { ResponseSocialUserDTO } from "../dtos/social_user.dto";


@Service()
@JsonController('/user')
export class UserController {
    constructor(@Inject(() => UserService) private user: UserService) {

    }


    @Get('/signup/kakao') // 백엔드에서 대부분 처리해서 get으로 받아야함
    @HttpCode(200)
    public async signup_login_kakao(@QueryParam('code') code: string, @Session() session: any) {

        const new_user = await this.user.kakao_signup(code);
        const response_user = new ResponseSocialUserDTO(new_user);
        session.user_id = new_user.id;
        return {
            message: "카카오 로그인 성공",
            data: response_user,
        }
    }

    @Post('/signup/kakao/url')
    @HttpCode(201)
    public kakao_signup_url() {

        return {
            message: "카카오 url 전송",
            data: this.user.kakao_signup_url(),
        }
    }

    @Get('/logout/kakao')
    @HttpCode(200)
    public async kakao_logout(@Session() session: any, @Res() res: Response) {
        try {
            console.log(`세션: ${session?.user_id}`);

            if (session?.user_id) {
                await this.user.kakao_logout(session.user_id);
                await session.destroy();
                res.clearCookie('connect.sid'); // 쿠키 제거
                return res.json({ message: "로그아웃 성공" });
            }
            else {
                return res.status(200).json({ message: "이미 로그아웃된 상태입니다" });
            }
        } catch (error) {
            console.error("로그아웃 처리 중 에러:", error);
            return res.status(500).json({ message: "서버 오류로 인해 로그아웃 실패" });
        }
    }


    @Get('/withdrawal/kakao')
    @HttpCode(200)
    public async kakao_withdrawl(@Session() session: any, @Res() res: Response) {
        try {
            if (session.user_id) {
                await this.user.kakao_withdrawal(session.user_id);
                await session.destroy();
                res.clearCookie('connect.sid'); // 쿠키 제거
                return res.json({ message: "회원탈퇴 성공" });
            }
            else {
                return res.status(200).json({ message: "시간이 경과하여 로그아웃 되었습니다. 다시 로그인해주세요" });
            }
        } catch (error) {
            console.error("회원탈퇴 처리 중 에러:", error);
            return res.status(500).json({ message: "서버 오류로 인해 회원탈퇴 실패" });
        }

    }
}
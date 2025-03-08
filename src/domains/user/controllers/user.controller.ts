import { Delete, Get, HttpCode, JsonController, Param, Params, Post, QueryParam, Req, Res, Session, SessionParam } from "routing-controllers";
import Container, { Inject, Service } from "typedi";
import { UserService } from "../services/user.service";
import { Request, Response } from 'express';
import { ResponseSocialUserDTO } from "../dtos/social_user.dto";
import { ValidationError } from "@/common/exceptions/app.error";
import session from "express-session";
import { EnvConfig } from "@/config/env.config";
import { resolve } from "path";


@Service()
@JsonController('/user')
export class UserController {
    constructor(@Inject(() => UserService) private user: UserService,
        @Inject(() => EnvConfig) private env: EnvConfig) {

    }


    @Get('/signup/kakao') // 백엔드에서 대부분 처리해서 get으로 받아야함
    @HttpCode(200)
    public async signup_login_kakao(@Param('code') code: string, @Session() session: session.Session & Partial<session.SessionData>, @Res() res: Response, @Req() req: Request) {

        const new_user = await this.user.kakao_signup(code);
        const response_user = new ResponseSocialUserDTO(new_user);

        console.log('받은 요청', req.hostname);

        session.user_id = new_user.id;
        const userAgent = req.headers['user-agent'] || '';

        await new Promise<void>((resolve, reject) => {
            session.save((err) => {
                if (err) {
                    console.error('세션 저장 오류:', err);
                    return res.status(500).json({ error: "세션 제거 중 오류 발생" });
                }
                resolve();
            });
        });
        return {
            message: "회원 정보 조회 전송",
            data: response_user,
        }

    }

    @Post('/signup/kakao/url')
    @HttpCode(201)
    public kakao_signup_url(@Req() req: Request, @Res() res: Response) {

        return this.user.kakao_signup_url();
    }

    @Post('/logout/kakao')
    @HttpCode(200)
    public async kakao_logout(@Session() session: session.Session & Partial<session.SessionData>, @Res() res: Response) {
        try {
            console.log(`세션: ${session?.user_id}`);

            if (session?.user_id) {
                await this.user.kakao_logout(session.user_id);

                await new Promise<void>((resolve, reject) => {
                    session.destroy((err) => {
                        if (err) {
                            console.error('세션 제거 오류:', err);
                            return res.status(500).json({ error: "세션 저장 중 오류 발생" });
                        }
                        resolve();
                    });
                })

                res.clearCookie(this.env.FRONT_COOKIE_NAME); // 쿠키 제거
                return res.json({ message: "로그아웃 성공" });
            }
            else {
                return res.status(410).json({ message: "이미 로그아웃된 상태입니다" });
            }
        } catch (error) {
            console.error("로그아웃 처리 중 에러:", error);
            return res.status(500).json({ error: "서버 오류로 인해 로그아웃 실패" });
        }
    }


    @Delete('/withdrawal/kakao')
    @HttpCode(200)
    public async kakao_withdrawl(@Session() session: session.Session & Partial<session.SessionData>, @Res() res: Response) {
        try {
            if (session.user_id) {
                await this.user.kakao_withdrawal(session.user_id);

                await new Promise<void>((resolve, reject) => {
                    session.destroy((err) => {
                        if (err) {
                            console.error('세션 제거 오류:', err);
                            return res.status(500).json({ error: "세션 제거 중 오류 발생" });
                        }
                        resolve();
                    });
                })

                res.clearCookie(this.env.FRONT_COOKIE_NAME); // 쿠키 제거
                return res.json({ message: "회원탈퇴 성공" });
            }
            else {
                return res.status(410).json({ message: "시간이 경과하여 로그아웃 되었습니다. 다시 로그인해주세요" });
            }
        } catch (error) {
            console.error("회원탈퇴 처리 중 에러:", error);
            return res.status(500).json({ error: "서버 오류로 인해 회원탈퇴 실패" });
        }
    }


    @Get('')
    @HttpCode(200)
    public async find_user(@Session() r_session: session.Session & Partial<session.SessionData>, @Req() req?: Request) {

        // r_session = req.session 세션 전체 정보 쿠키, 세션 내용(user_id)
        // req.sessionID = req.session.id = redis session key
        // r_session.user_id = req.session.user_id =  세션 내용(user_id)


        if (r_session?.user_id && r_session) {
            const find_user = await this.user.find_profile(r_session.user_id);
            const response_user = new ResponseSocialUserDTO(find_user);
            return {
                message: "세션 조회 성공",
                data: response_user,
            }
        }
        else {
            return {
                message: "세션 조회 실패",
                data: null,
            }
        }

    }

}
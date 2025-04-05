import { Body, Delete, Get, HttpCode, JsonController, Param, Params, Post, QueryParam, Req, Res, Session, SessionParam } from "routing-controllers";
import Container, { Inject, Service } from "typedi";
import { UserService } from "../services/user.service";
import { Request, Response } from 'express';
import { ResponseSocialUserDTO } from "../dtos/social_user.dto";
import { ExternalApiError, NotSessionError, ValidationError, UnauthorizedError } from "@/common/exceptions/app.error";
import session from "express-session";
import { EnvConfig } from "@/config/env.config";

import { plainToInstance } from "class-transformer";
import { logger } from "@/common/logging/logger";


@Service()
@JsonController('/user')
export class UserController {
    constructor(@Inject(() => UserService) private user: UserService,
        @Inject(() => EnvConfig) private env: EnvConfig) {

    }



    private async destroySession(session: session.Session & Partial<session.SessionData>, res: Response) {
        await new Promise<void>((resolve, reject) => {
            session.destroy((err) => {
                if (err) {
                    throw new ValidationError("세션 제거 오류", err);
                }
                resolve();
            });
        })

        res.clearCookie(this.env.FRONT_COOKIE_NAME); // 쿠키 제거
    }

    @Get('/signup/kakao') // 백엔드에서 대부분 처리해서 get으로 받아야함
    @HttpCode(200)
    public async signup_login_kakao(@QueryParam('code') code: string, @Session() session: session.Session & Partial<session.SessionData>,
        @Res() res: Response, @Req() req: Request, @QueryParam('redirect_url', {required: false}) redirect_url?: string,
        @QueryParam('state', { required: false }) state?: string,) {

        if (state) { //앱
            
            logger.info("앱 카카오 로그인");
            const backend_redirect_url = `${req.protocol}://${req.headers.host}/user/signup/kakao`;
            
            const new_user = await this.user.kakao_signup(code, backend_redirect_url);
            const response_user = plainToInstance(ResponseSocialUserDTO, new_user, {
                excludeExtraneousValues: true,
            })

            session.user = response_user; //백엔드의 세션을 사용

            return res.redirect(`${state}?session_id=${session.id}`);
        }
        else if (redirect_url) { //웹
            const new_user = await this.user.kakao_signup(code, redirect_url);
            const response_user = plainToInstance(ResponseSocialUserDTO, new_user, {
                excludeExtraneousValues: true,
            })

            session.user = response_user; //프론트의 세션을 사용

            await new Promise<void>((resolve, reject) => {
                session.save((err) => {
                    if (err) {
                        throw new ValidationError("세션 저장 오류", err);
                    }
                    resolve();
                });
            });

            return {
                message: "회원 정보 세션 전송",
                data: session.user,  //세션 유저 정보 전송
                session_id: session.id,//세션 아이디 전송
            }
        }
        else {
            throw new UnauthorizedError("카카오 크로스 환경 설정 중 문제 발생");
        }




    }

    @Post('/signup/kakao/url')
    @HttpCode(201)
    public kakao_signup_url(@Req() req: Request, @Body() body: { redirect_url: string }) {

        const backend_redirect_url = `${req.protocol}://${req.headers.host}/user/signup/kakao`;
        const { redirect_url } = body;

        const user_agent = req.headers["user-agent"] || '';

        let url;
        if (user_agent.includes('Mozilla')) { // 웹
            url = this.user.kakao_signup_url(redirect_url);
        }
        else { // 앱앱
            url = this.user.kakao_signup_url(redirect_url, backend_redirect_url);
        }
        return {
            data: url
        }
    }

    @Post('/logout/kakao')
    @HttpCode(200)
    public async kakao_logout(@Session() session: session.Session & Partial<session.SessionData>, @Res() res: Response, @Req() req: Request) {
        try {
            console.log(`세션: ${session?.user}`);

            const user = session.user;

            if (!user)
                throw new NotSessionError();

            await this.user.kakao_logout(user.id);
            await this.destroySession(session, res);

            return {
                message: "로그아웃 성공",
            }

        } catch (error) {
            throw new ExternalApiError("카카오 오류로 인해 로그아웃 실패");
        }
    }


    @Delete('/withdrawal/kakao')
    @HttpCode(200)
    public async kakao_withdrawl(@Session() session: session.Session & Partial<session.SessionData>, @Res() res: Response, @Req() req: Request) {
        try {

            const user = session.user;

            if (!user)
                throw new NotSessionError();

            await this.user.kakao_withdrawal(user.id);
            await this.destroySession(session, res);

            return {
                message: "회원탈퇴 성공"
            }

        } catch (error) {
            throw new ExternalApiError("카카오 오류로 인해 회원탈퇴 실패");
        }
    }


    @Get('')
    @HttpCode(200)
    public async find_user(@Session() session: session.Session & Partial<session.SessionData>, @Req() req: Request, @Res() res: Response) {

        // r_session = req.session 세션 전체 정보 쿠키, 세션 내용(user_id)
        // req.sessionID = req.session.id = redis session key
        // r_session.user_id = req.session.user_id =  세션 내용(user_id)
        const user = session.user;

        if (!user)
            throw new NotSessionError();

        return {
            message: "세션 사용자 조회 성공",
            data: user,
        }

    }

}
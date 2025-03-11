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


    @Get('/signup/kakao/:code') // 백엔드에서 대부분 처리해서 get으로 받아야함
    @HttpCode(200)
    public async signup_login_kakao(@Param('code') code: string, @Session() session: session.Session & Partial<session.SessionData>, @Res() res: Response, @Req() req: Request) {

        const new_user = await this.user.kakao_signup(code);
        const response_user = new ResponseSocialUserDTO(new_user);

        console.log('받은 요청', req.hostname);

        session.user = response_user;

        //const userAgent = req.headers['user-agent'] || '';

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
            message: "회원 정보 세션 전송",
            data: session.user, //세션 아이디 전송
            session_id: session.id,
        }

    }

    @Post('/signup/kakao/url')
    @HttpCode(201)
    public kakao_signup_url() {

        return this.user.kakao_signup_url();
    }

    @Post('/logout/kakao')
    @HttpCode(200)
    public async kakao_logout(@Session() session: session.Session & Partial<session.SessionData>, @Res() res: Response, @Req() req: Request) {
        try {
            console.log(`세션: ${session?.user}`);

            const sessionId = req.headers.authorization?.split(" ")[1];

            if (session.user) {
                await this.user.kakao_logout(session.user.id);

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

            else if (sessionId) {
                const session_data: ResponseSocialUserDTO | null = await new Promise((resolve, reject) => {
                    req.sessionStore.get(sessionId, (err, session) => {
                        if (err) {
                            reject(err);
                        }
                        else if (!session)
                            resolve(null);
                        else
                            resolve(session.user);

                    })
                })
                if (!session_data) {
                    return res.status(401).json({ message: "세션이 유효하지 않음" });
                }
                await this.user.kakao_logout(session_data.id);

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
                return res.status(202).json({ message: "해당 세션을 찾을수 없습니다. 이미 로그아웃된 상태입니다" });
            }
        } catch (error) {
            console.error("로그아웃 처리 중 에러:", error);
            return res.status(500).json({ error: "서버 오류로 인해 로그아웃 실패" });
        }
    }


    @Delete('/withdrawal/kakao')
    @HttpCode(200)
    public async kakao_withdrawl(@Session() session: session.Session & Partial<session.SessionData>, @Res() res: Response, @Req() req: Request) {
        try {
            const sessionId = req.headers.authorization?.split(" ")[1];

            if (session.user) {
                await this.user.kakao_withdrawal(session.user.id);

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

            else if (sessionId) {
                const session_data: ResponseSocialUserDTO | null = await new Promise((resolve, reject) => {
                    req.sessionStore.get(sessionId, (err, session) => {
                        if (err) {
                            reject(err);
                        }
                        else if (!session)
                            resolve(null);
                        else
                            resolve(session.user);

                    })
                })
                if (!session_data) {
                    return res.status(401).json({ message: "세션이 유효하지 않음" });
                }
                await this.user.kakao_withdrawal(session_data.id);

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
                return res.json({ message: "회원탈퇴 성공" });
            }

            else {
                return res.status(202).json({ message: "시간이 경과하여 로그아웃 되었습니다. 다시 로그인해주세요" });
            }
        } catch (error) {
            console.error("회원탈퇴 처리 중 에러:", error);
            return res.status(500).json({ error: "서버 오류로 인해 회원탈퇴 실패" });
        }
    }


    @Get('')
    @HttpCode(200)
    public async find_user(@Session() session: session.Session & Partial<session.SessionData>, @Req() req: Request, @Res() res: Response) {

        // r_session = req.session 세션 전체 정보 쿠키, 세션 내용(user_id)
        // req.sessionID = req.session.id = redis session key
        // r_session.user_id = req.session.user_id =  세션 내용(user_id)

        try {
            const sessionId = req.headers.authorization?.split(" ")[1];
            if (session.user) { //일반 웹에서
                return {
                    message: "세션 조회 성공",
                    data: session.user,
                }
            }

            else if (sessionId) { //앱에서 보낸거임

                const session_data = await new Promise((resolve, reject) => {
                    req.sessionStore.get(sessionId, (err, session) => {
                        if (err) {
                            reject(err);
                        }
                        else if (!session)
                            resolve(null);
                        else
                            resolve(session.user);

                    })
                })

                if (!session_data) {
                    return res.status(401).json({ message: "세션이 유효하지 않음" });
                }
                return res.json({ message: "인증된 사용자입니다", data: session_data });
            }

            else {
                return res.status(401).json({ message: "세션이 유효하지 않음" });
            }
        } catch (error) {
            console.error("세션 조회 중 오류 발생:", error);
            return res.status(500).json({ message: "서버 오류" });
        }


    }

}
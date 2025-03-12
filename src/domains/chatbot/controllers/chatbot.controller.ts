import { Body, Get, HttpCode, JsonController, Post, Req, Res, Session } from "routing-controllers";
import { Inject, Service } from "typedi";
import { ChatBot } from "../services/chatbot.service";
import session from "express-session";
import { Request, Response } from 'express';
import { ResponseSocialUserDTO } from "@/domains/user/dtos/social_user.dto";
import { Chat_Message } from "@/api/chatgpt_ai";

@Service()
@JsonController('/chatbot')
export class ChatBotController {
    constructor(@Inject(() => ChatBot) private chatbot: ChatBot) {

    }

    private async getSessionUser(req: Request): Promise<ResponseSocialUserDTO | null> {
        const session_id = req.headers.authorization?.split(" ")[1];

        if (!session_id)
            return null;

        const session_data: ResponseSocialUserDTO | null = await new Promise((resolve, reject) => {
            req.sessionStore.get(session_id, (err, session) => {
                if (err) {
                    reject(err);
                }
                else if (!session)
                    resolve(null);
                else
                    resolve(session.user);

            });
        });

        return session_data;

    }

    @Post('')
    @HttpCode(201)
    public async write_chatbot(@Body() body: { content: string }, @Session() session: session.Session & Partial<session.SessionData>, @Req() req: Request, @Res() res: Response) {

        try {
            if (!body)
                return res.status(400).json({ message: "메세지가 없습니다" });

            const user = session.user || await this.getSessionUser(req);

            if (!user)
                return res.status(401).json({ message: "세션이 유효하지 않음" });

            const answer = await this.chatbot.create_chatbot(body.content, user.id);

            return {
                message: "챗봇 답변 성공",
                data: answer,
            }

        } catch (error) {
            console.error("챗봇 쓰기 오류", error);
            return res.status(500).json({ message: "서버 오류 발생" });
        }
    }

    @Get('')
    @HttpCode(200)
    public async read_chatbot_list(@Session() session: session.Session & Partial<session.SessionData>, @Req() req: Request, @Res() res: Response) {

        try {
            const user = session.user || await this.getSessionUser(req);
            if (!user) {
                return res.status(401).json({ message: "세션이 유효하지 않음" });
            }

            const history: Chat_Message[] = await this.chatbot.load_history(user.id);

            return {
                message: "챗봇 채팅 반환 성공",
                data: history,
            }

        } catch (error) {
            console.error("챗봇 읽기 오류", error);
            return res.status(500).json({ message: "서버 오류 발생" });
        }
    }

}
import { Chat_Message, CHATGPT_API } from "@/api/chatgpt_ai";
import { ExternalApiError, NotFoundError } from "@/common/exceptions/app.error";
import { Redis } from "@/common/services/redis.service";
import { Message } from "coolsms-node-sdk";
import { Inject, Service } from "typedi";



@Service()
export class ChatBot {

    private chat_history: Array<Chat_Message> = []
    private prefix = "chatbot_id"
    private HISTROY_COUNT = 11;

    constructor(@Inject(() => CHATGPT_API) private chatgpt: CHATGPT_API,
        @Inject(() => Redis) private redis: Redis) {

    }

    public async load_history(user_id: number): Promise<Chat_Message[]> {

        try {
            const chat_key = `${this.prefix}:${user_id}`;

            await this.redis.getClient().lTrim(chat_key, - this.HISTROY_COUNT + 1, -1);
            //0~9 10개 까지만 저장하도록 삭제 

            // string으로 된 채팅 배열 마지막에 저장

            const history = await this.redis.getClient().lRange(chat_key, 0, -1);
            //총 11개( 유저 메세지 1개 + 대화내역 (유저 5 답변 5) 의 배열 저장

            if (history.length < 1)
               return [];

            const history_list: Chat_Message[] = history.map(message => JSON.parse(message));

            return history_list;
        } catch (error) {
            throw new ExternalApiError("챗봇 기록 불러오는 중 오류 발생");
        }

    }

    public async save_answer(answer: string, user_id: number) {
        try {
            const chat_key = `${this.prefix}:${user_id}`;

            const chat_answer: Chat_Message = { role: "assistant", content: answer };

            const json_answer = JSON.stringify(chat_answer);

            await this.redis.getClient().rPush(chat_key, json_answer);
        } catch (error) {
            throw new ExternalApiError("채팅 답변 저장 실패");
        }
    }

    public async save_question(content: string, user_id: number) {
        try {

            const chat_key = `${this.prefix}:${user_id}`;

            const chat_question: Chat_Message = { role: "user", content: content };

            const json_question = JSON.stringify(chat_question);

            
            await this.redis.getClient().rPush(chat_key, json_question);
        } catch (error) {
            throw new ExternalApiError("채팅 질문문 저장 실패");
        }
    }

    public async create_chatbot(message: string, user_id: number): Promise<string> {

        try {

            await this.save_question(message, user_id);
            //질문 저장
            const chat_history = await this.load_history(user_id);
            //질문 저장한 내역 조회
            const answer = await this.chatgpt.create_chatbot(chat_history);
            // 내역을 조건으로 챗봇 생성
            if (!answer)
                throw new NotFoundError("챗봇 대답을 찾을 수 없습니다");

            await this.save_answer(answer, user_id);
            //답변을 저장

            return answer;

        } catch (error) {
            console.error("챗봇 오류 발생", error);
            throw new ExternalApiError("챗봇 사용 중 오류 발생");
        }
    }
}

import { EnvConfig } from "@/config/env.config";
import OpenAI from "openai";
import Container, { Inject, Service } from "typedi";

export interface Chat_Message {
  role: "system" | "user" | "assistant",
  content: string,
}

@Service()
export class CHATGPT_API {
  private openai: OpenAI;
  constructor(@Inject(() => EnvConfig) private readonly config: EnvConfig) {
    this.openai = new OpenAI({
      apiKey: this.config.CHATGPT_API_KEY,
      organization: "org-RLQBbdFBYlaJsbMb4mgQoxOD",
      project: this.config.CHATGPT_PROJECT_ID,
    })
  }

  public async create_chatbot(history: Chat_Message[]): Promise<string> {

    try {

      const formatted_messages = history.map(message => (
        {
          role: message.role,
          content: typeof message.content === "string" ? message.content : JSON.stringify(message.content)
        }
      ))

      const chat_completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "당신은 물류 및 송장 데이터를 분석하는 전문 AI 챗봇입니다. 사용자의 질문에 대해 정확하고 신뢰할 수 있는 정보를 제공합니다. 답변은 한글(한국어)로 제공합니다." },
          ...formatted_messages, // 0번이 오래 된게 와야함함
        ],
        temperature: 0.5,
        max_tokens: 1024,
      });

      const answer = chat_completion.choices[0].message.content!;

      return answer;
    }
    catch (error) {
      console.error("OpenAI API 호출 오류:", error);
      return "오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
    }

  }
}

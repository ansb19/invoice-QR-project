
import { EnvConfig } from "@/config/env.config";
import OpenAI from "openai";
import Container, { Inject, Service } from "typedi";

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

  public async create_chatbot(message: string): Promise<string> {

    const chat_completion = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { "role": "developer", "content": "you are chat bot assistant about delivery, qr, address" },
        { "role": "assistant", "content": "you have to answer only about delivery and address" },
        { "role": "user", "content": message },
      ],
      store: true,
      temperature: 1.0,
      max_tokens: 1024,
    });

    return chat_completion.choices[0].message.content!;
  }

  async split_delivery_spot(terminal_keyword: string): Promise<string> {

    const chat_completion = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { "role": "developer", "content": "You are an address lookup tool. Respond only with the CJ대한통운 terminal address in South Korea in the following format: { lat: <latitude>, lon: <longitude> }. Do not provide any extra information, only the exact latitude and longitude in this format." },
        { "role": "user", "content": `cj 대한통운의 ${terminal_keyword} 주소를 좌표로 알려줘. { lat: 위도, lon: 경도 } 이런식으로 알려줘.` },
      ],
      temperature: 0.2,
      top_p: 0.1,
    })

    return chat_completion.choices[0].message.content!;
  }
}

const env = new EnvConfig();
const test = new CHATGPT_API(env);

test.create_chatbot("cj대한통운의 택배 환불 정책에 대해 알려줘").then((result) => console.log(result));

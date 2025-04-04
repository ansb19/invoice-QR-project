import { Action, Interceptor, InterceptorInterface } from "routing-controllers";
import { Service } from "typedi";

@Service()
@Interceptor({ priority: 3 }) //숫자가 클수록 먼저 실행됨
export class ResponseFormatInterceptor implements InterceptorInterface {
    async intercept(action: Action, result: any): Promise<any> {

        if (!result || typeof result !== "object") {
            return {
                success: false,
                message: "데이터 없음",
            };
        }

        if (result?.success !== undefined)
            return result;

        const { message, data, ...rest } = result ?? {};

        console.log("요청 경로:", action.request.url);

        console.log("result:", result);


        return {
            success: true,
            message: message ?? "성공", // ??는 undefined, null만 ||는 false, 0, "", Nan 도 무시
            ...(data !== undefined && { data }), // &&는 참객체 반환 ...은 객체 병합인데 false 받으면 필드 자체가 안 생김
            ...(Object.keys(rest).length > 0 && { meta: rest }),
        }
    }

}
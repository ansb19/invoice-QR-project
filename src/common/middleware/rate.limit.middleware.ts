import { ExpressMiddlewareInterface, Middleware } from "routing-controllers";
import { Service } from "typedi";
import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";



@Middleware({ type: "before" })
export class RateLimitMiddleware implements ExpressMiddlewareInterface {

    private limiter = rateLimit({
        windowMs: 1000 * 60, // 1분
        max: 100,
        standardHeaders: true,
        legacyHeaders: false,
        message: { success: false, message: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." },
    })
    use(request: Request, response: Response, next: NextFunction) {
        this.limiter(request, response, next);
    }
    // api 호출 수 제한 가능, 디도스 방어 가능, 로그인 시도 반복 차단 가능
}
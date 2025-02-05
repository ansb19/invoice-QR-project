import { ExpressMiddlewareInterface, Middleware } from "routing-controllers";
import { Request, Response, NextFunction } from "express";
import { NotFoundError } from "@/common/exceptions/app.error";
import { logger } from "@/common/logging/logger";
import { Service } from "typedi";

@Service()
@Middleware({ type: "after" }) // 컨트롤러 -> 응답 사이에 사용
export class NotFoundMiddleware implements ExpressMiddlewareInterface {
    use(req: Request, res: Response, next: NextFunction): void {
        logger.warn(`Invalid route accessed url: ${req.originalUrl}`);
        next(new NotFoundError("요청한 경로를 찾을 수 없습니다"));
    }
}
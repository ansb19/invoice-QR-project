import { ExpressErrorMiddlewareInterface, Middleware } from "routing-controllers";
import { Inject, Service } from "typedi";
import { Request, Response, NextFunction } from "express";
import { logger } from "@/common/logging/logger";
import { EnvConfig } from "@/config/env.config";

@Service()
@Middleware({ type: 'after' })
export class ErrorHandleMiddleware implements ExpressErrorMiddlewareInterface {
    constructor(@Inject(() => EnvConfig) private env: EnvConfig) {

    }
    error(error: any, request: Request, response: Response, next: NextFunction): void {
        
        // if (response.headersSent) {
        //     return next(error); // 이미 응답이 나갔으면 더 이상 처리하지 않음
        //   }

        const status = error.status_code || error.httpcode || 500;
        const message = error.message || "서버 오류가 발생했습니다. 관리자에게 문의하세요";

        logger.error(`에러 발생: ${request.method} ${request.url} - ${status}: ${message}`);
        if (error.stack) logger.error(error.stack);
        if (error.cause) logger.error("Cause: ", error.cause);

        response.status(status).json({
            success: false,
            message,
            ...(this.env.NODE_ENV !== "production" && {error: error.stack})
        });

        
    }
}
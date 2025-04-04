
import { logger } from "@/common/logging/logger";
import { Request, Response, NextFunction } from "express";
import { ExpressMiddlewareInterface, Middleware } from "routing-controllers";
import { Service } from "typedi";


@Middleware({ type: 'before' }) // 요청 -> 컨트롤러 사이에 사용
export class LoggerMiddlerWare implements ExpressMiddlewareInterface {
    use(request: Request, response: Response, next: NextFunction) {
        const { method,originalUrl, ip } = request;
        const message = `Request: ${method} ${originalUrl} - from ${ip}`;

        logger.debug(message);

        const start_time = Date.now();
        response.on("finish", () => {
            const duration = Date.now() - start_time;
            const { statusCode } = response;
            logger.debug(`Response: ${statusCode} ${method} ${originalUrl} (${duration}ms)`);
        });

        next();
    }
}

import { logger } from "@/common/logging/logger";
import { Request, Response, NextFunction } from "express";
import { ExpressMiddlewareInterface, Middleware } from "routing-controllers";
import { Service } from "typedi";

@Service()
@Middleware({ type: 'before' }) // 요청 -> 컨트롤러 사이에 사용
export class LoggerMiddlerWare implements ExpressMiddlewareInterface {
    use(request: Request, response: Response, next: NextFunction) {
        const { method, url } = request;
        const message = `Request: ${method} ${url}`;

        logger.info(message);

        response.on("finish", () => {
            const { statusCode } = response;
            logger.info(`Response: ${statusCode} ${url}`);
        });

        next();
    }
}
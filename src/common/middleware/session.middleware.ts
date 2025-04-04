import { ExpressMiddlewareInterface, Middleware, UseBefore } from "routing-controllers";
import { Request, Response, NextFunction } from "express";
import { logger } from "@/common/logging/logger";
import { RedisStore } from "connect-redis";
import { Inject, Service } from "typedi";
import { Redis } from "@/common/services/redis.service";
import { EnvConfig } from "@/config/env.config";
import session from "express-session";
import { TTL_Time } from "@/common/utils/enum.control";


@Service()
@Middleware({ type: 'before' }) //요청 -> 컨트롤러 사이에 사용
export class SessionMiddleware implements ExpressMiddlewareInterface {

    constructor(
        @Inject(() => Redis) private redis: Redis,
        @Inject(() => EnvConfig) private readonly config: EnvConfig,
    ) {
        logger.info('Initializing Express session middleware...');

    }
    use(req: Request, res: Response, next: NextFunction): void {

        const userAgent = req.headers['user-agent'] || '';

        const sessionMiddleware = session({
            store: new RedisStore({ client: this.redis.getClient(), prefix: "session:" }),
            secret: this.config.SESSION_SECRET,
            resave: false,
            saveUninitialized: false,
            name: this.config.FRONT_COOKIE_NAME,
            cookie: {
                httpOnly: true,
                secure: this.config.NODE_ENV === "production",
                maxAge: userAgent.includes('Mozilla') ? TTL_Time.LOGIN_WEB_TTL : TTL_Time.LOGIN_APP_TTL // 세션 유형별로 다르게 설정 가능
            },
            rolling: false, //모든 요청(Request)마다 세션의 maxAge(만료 시간)가 리셋됨 // 수동 갱신

        });

        sessionMiddleware(req, res, next);
    }
}



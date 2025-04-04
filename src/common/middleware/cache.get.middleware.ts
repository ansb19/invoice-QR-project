import { Redis } from "@/common/services/redis.service";
import { ExpressMiddlewareInterface, Middleware } from "routing-controllers";
import { Inject, Service } from "typedi";
import { Request, Response, NextFunction } from "express";
import { logger } from "@/common/logging/logger";

@Service()
@Middleware({ type: 'before' })
export class CacheGetMiddleware implements ExpressMiddlewareInterface {

    constructor(@Inject(() => Redis) private redis: Redis,
    ) { }
    async use(request: Request, response: Response, next: NextFunction) {

        const ip = request.ip || request.headers['x-forwarded-for'] || request.socket.remoteAddress; 

        const cache_key = `cache:${ip}:${request.originalUrl}`; // url을 키로 사용
        const cached = await this.redis.get(cache_key);
        
        if(cached){
            logger.info("cache hit", cache_key);
            return response.json(JSON.parse(cached));
        }
        else{
            logger.info("cache miss", cache_key);
        }

        next();
    }

}
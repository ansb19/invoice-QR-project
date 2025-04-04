import { Action, Interceptor, InterceptorInterface } from "routing-controllers";
import { Inject, Service } from "typedi";
import { Redis } from "../services/redis.service";
import { TTL_Time } from "../utils/enum.control";
import { logger } from "../logging/logger";
import { CacheStoreError } from "../exceptions/app.error";

@Service()
@Interceptor({ priority: 2 })
export class CacheSetInterceptor implements InterceptorInterface {

    constructor(@Inject(() => Redis) private redis: Redis) {

    }

    async intercept(action: Action, result: any): Promise<any> {

        const ip = action.request.ip || action.request.headers['x-forwarded-for'] || action.request.socket.remoteAddress;
        const cache_key = `cache:${ip}:${action.request.originalUrl}`; // url을 키로 사용

        if (result?.success === true && "data" in result) {
            try {
                await this.redis.set(cache_key, JSON.stringify(result), TTL_Time.CACHE_TTL);
                logger.info("cache 저장", cache_key);
            } catch (error) {
                throw new CacheStoreError("캐시 저장 중 오류 발생", error as Error);
            }
        }
        else {
            logger.info("cache 저장 실패", cache_key);
        }

        return result;
    }

}
import { Redis } from "@/common/services/redis.service";
import { ExpressMiddlewareInterface, Middleware } from "routing-controllers";
import { Inject, Service } from "typedi";
import { Request, Response, NextFunction } from "express";

@Service()
@Middleware({ type: 'before' })
export class CacheMiddleware implements ExpressMiddlewareInterface {

    constructor(@Inject(() => Redis) private redis: Redis,
    ) { }
    async use(request: Request, response: Response, next: NextFunction) {

        const key = request.originalUrl; // url을 키로 사용
        if (request.method !== 'GET')
            next();

        try {
            const cache_data = await this.redis.get(key);

            if (cache_data) {
                // 인포 넣기
                console.log("캐시된 데이터:", cache_data);
                return response.json({
                    message: "캐싱된 데이터 조회 성공",
                    data: JSON.parse(cache_data),
                })
            }
            next(); // 캐시에 없으면 다음 미들웨어로 이동
        } catch (error) {
            console.error("Redis error:", error);
            next(); // Redis 에러 발생 시 그냥 넘어감
        }
    }
    //이래서 get이면 get으로 하는거지 post 쓰지 말란거군!

}
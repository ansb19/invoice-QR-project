import { ExpressMiddlewareInterface, Middleware } from "routing-controllers";
import { Service } from "typedi";
import { Request, Response, NextFunction } from "express";

// const whitelist = [
//     "http://localhost:3000",
//     "https://admin.mysite.com",
//     "https://staging.mysite.com",
//   ];


@Middleware({ type: "before" })
export class CorsMiddleware implements ExpressMiddlewareInterface {
    use(request: Request, response: Response, next: NextFunction) {

        const origin = request.headers.origin;

        // cors를 따로 쓰는 이유
        //  // 1️⃣ 특정 라우트만 허용
        //  if (req.originalUrl.startsWith("/admin") && origin !== "https://admin.mysite.com") {
        //     return res.status(403).json({ message: "관리자 페이지 접근 불가" });
        //   }

        //   // 2️⃣ 토큰이 있는 경우만 허용 (조건부)
        //   if (req.originalUrl.startsWith("/secure") && !req.headers.authorization) {
        //     return res.status(401).json({ message: "인증 토큰 필요" });
        //   }

        //   // 3️⃣ 화이트리스트 기반 동적 Origin 설정
        //   if (origin && whitelist.includes(origin)) {
        //     res.header("Access-Control-Allow-Origin", origin);
        //   } 

        //   res.header("Access-Control-Allow-Credentials", "true");
        //   res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
        //   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");

        //   if (req.method === "OPTIONS") {
        //     return res.sendStatus(204);
        //   }

        response.header("Access-Control-Allow-Origin", origin || "*")
        response.header("Access-Control-Allow-Credentials", "true");
        response.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
        response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");

        if(request.method === "OPTIONS"){
            return response.sendStatus(204);
        }

        next();
    }

}
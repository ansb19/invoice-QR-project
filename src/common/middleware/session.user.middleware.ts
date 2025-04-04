import { ExpressMiddlewareInterface, Middleware } from "routing-controllers";
import { Service } from "typedi";
import { Request, Response, NextFunction } from "express";
import { ResponseSocialUserDTO } from "@/domains/user/dtos/social_user.dto";


@Middleware({ type: "before" })
export class SessionUserMiddleware implements ExpressMiddlewareInterface {
    use(request: Request, response: Response, next: NextFunction): void {

        if (request.session?.user) {
            request.session.touch();
            return next(); // 세션에 이미 유저 정보 있으면 바로 진행
        }

        const session_id = request.headers.authorization?.split(" ")[1];
        if (!session_id) {
            return next();
        }


        request.sessionStore.get(session_id, (err, session) => {
            if (err || !session?.user) {
                return next();
            }

            if (request.session) {
                request.session.user = session.user;
            }
            return next();
        })
    }

}
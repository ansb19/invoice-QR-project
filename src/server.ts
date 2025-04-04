import 'reflect-metadata';
import 'tsconfig-paths/register';

import express from 'express';
import Container from 'typedi';
import { useContainer as useValidatorContainer, Validate, Validator } from 'class-validator';
import { useExpressServer, useContainer as useControllerContainer } from 'routing-controllers';
import { EnvConfig } from './config/env.config';
import { logger } from './common/logging/logger';
import { LoggerMiddlerWare } from './common/middleware/logger.middleware';
import { Database } from './config/database/Database';
import { Redis } from './common/services/redis.service';
import { NotFoundError } from './common/exceptions/app.error';
import { UserController } from './domains/user/controllers/user.controller';
import cron from 'node-cron';
import { UserService } from './domains/user/services/user.service';
import { SessionMiddleware } from './common/middleware/session.middleware';
import { InvoiceController } from './domains/Invoice/controllers/invoice.controller';
import { AddressController } from './domains/user/controllers/address.controller';
import { ChatBotController } from './domains/chatbot/controllers/chatbot.controller';
import { ResponseSocialUserDTO } from './domains/user/dtos/social_user.dto';
import { ErrorHandleMiddleware } from './common/middleware/error.handle.middleware';
import { CorsMiddleware } from './common/middleware/cors.middleware';
import { CacheGetMiddleware } from './common/middleware/cache.get.middleware';
import { RateLimitMiddleware } from './common/middleware/rate.limit.middleware';
import { SessionUserMiddleware } from './common/middleware/session.user.middleware';
import { ResponseFormatInterceptor } from './common/intercetors/response.format.interceptor';
import { CacheSetInterceptor } from './common/intercetors/cache.set.interceptor';

declare module 'express-session' {
    interface SessionData {
        user_id?: number;
        invoice_number: string;
        user: ResponseSocialUserDTO | null;
    }
}

const env_config = Container.get(EnvConfig);

//IoC 컨테이너 설정
useValidatorContainer(Container, {
    fallback: true,
    fallbackOnErrors: true
});
Container.set(Validator, new Validator());
useControllerContainer(Container, {
    fallback: true,
    fallbackOnErrors: true,
});


const port = env_config.PORT;

const app = express();

async function startServer() {
    try {
        logger.info('서버 시작 중...');

        // 데이터베이스 연결 초기화
        const database = Container.get(Database);
        await database.initialize();

        await database.runMigrations(); // 프로덕션 환경에서는 비활성화 가능

        // Redis 초기화
        const redis = Container.get(Redis);
        await redis.initialize();

        // cors , json parsing
        useExpressServer(app, {
            // cors: { 수동 cors 설정
            //     origin: true,
            //     credentials: true,
            // },
            //routePrefix: '/',
            controllers: [
                // ChatController,
                InvoiceController,
                // ShopController,
                UserController,
                AddressController,
                ChatBotController,
            ],
            middlewares: [LoggerMiddlerWare, RateLimitMiddleware, CorsMiddleware, SessionMiddleware, SessionUserMiddleware, //전처리
                 ErrorHandleMiddleware], //후처리
            interceptors: [ResponseFormatInterceptor, CacheSetInterceptor  ],
            classTransformer: true,
            classToPlainTransformOptions: {
                enableImplicitConversion: true,
            },
            plainToClassTransformOptions: {
                enableImplicitConversion: true,
            },
            validation: true, //class-validator 활성화

            development: env_config.NODE_ENV !== "production",
            defaultErrorHandler: false,
            // defaultErrorHandler: true → errorOverridingMap이 적용됨 ✅
            // defaultErrorHandler: false → 직접 에러를 핸들링해야 해서 errorOverridingMap이 무시됨 ❌
            errorOverridingMap: {
                //  "404": { message: "Page Not Found", statusCode: 404 }
            },
            // authorizationChecker: async (action, roles) => {
            //     const user = await getUserFromSession(action.request);
            //     return roles.includes(user.role);
            //   }, // 인가 체크함수  사용자 권한 확인하는 함수
            // currentUserChecker: async (action) => {
            //     return await getUserFromSession(action.request);
            //   }, // 로그인한 사용자 확인하는 함수

            defaults: {
                nullResultCode: 404,
                undefinedResultCode: 204,
                paramOptions: {
                    required: true,
                }
            }

        })

        app.set("trust proxy", 1); // 프로식 서버 설정

        // 기본 라우트
        app.get("/", (req, res) => {
            const currentTime = new Date();
            logger.info(`Current server time: ${currentTime}, 백엔드 접속`);
            res.send(`Welcome to the backend! time: ${currentTime}`);
        });

        app.get('/favicon.ico', (req, res) => { res.status(204).end() });


        app.use('*', (req, res, next) => {
            if (!res.headersSent) {
              logger.warn(`Invalid route accessed url: ${req.originalUrl}`);
              next(new NotFoundError("요청한 API 라우터를 찾을 수 없습니다."));
            }
          });

        // 서버 실행
        const server = app.listen(port, "0.0.0.0", () => {
            logger.info(`Server is running on port: ${port}`);
        });

        // 서버 종료 처리 (SIGTERM, SIGINT)
        process.on('SIGTERM', async () => {
            logger.info('SIGTERM signal received: closing HTTP server...');
            server.close(async () => {
                logger.info('HTTP server closed.');
                // 데이터베이스 연결 닫기
                await database.close();
                process.exit(0);
            });
        });

        process.on('SIGINT', async () => {
            logger.info('SIGINT signal received: closing HTTP server...');
            server.close(async () => {
                logger.info('HTTP server closed.');
                // 데이터베이스 연결 닫기
                await database.close();
                process.exit(0);
            });
        });

    } catch (error) {
        logger.error('Error during server initialization', error);
        process.exit(1); // 에러 발생 시 프로세스 종료
    }
}

startServer();

cron.schedule('0 0 * * *', async () => {
    logger.info('Starting token refresh job...');
    const user_service = Container.get(UserService);
    await user_service.auto_kakao_refresh_token();
    logger.info('Token refresh job completed.');
})
import { Body, Delete, Get, HttpCode, Interceptor, JsonController, Param, Patch, Post, QueryParam, Req, Res, ResponseClassTransformOptions, Session, UseBefore } from "routing-controllers";
import Container, { Inject, Service } from "typedi";
import { Delivery_Tracker } from "../services/delivery_tracker.service";
import session from "express-session";
import { Response, Request } from 'express';
import { plainToInstance } from "class-transformer";
import { validateOrReject, Validator } from "class-validator";
import { ResponseSocialUserDTO } from "@/domains/user/dtos/social_user.dto";
import {  NotSessionError } from "@/common/exceptions/app.error";
import { CacheGetMiddleware } from "@/common/middleware/cache.get.middleware";
import { DeliveryCoordDTO, DeliveryInfoDTO, DeliveryTrackDTO } from "../dtos/invoice.dto";
import { logger } from "@/common/logging/logger";

@Service()
@JsonController('/invoice')
export class InvoiceController {
    constructor(
        // @Inject(() => InvoiceService) private invoiceService: InvoiceService
        @Inject(() => Delivery_Tracker) private delivery_tracker: Delivery_Tracker,
    ) {

    }

    @Get('/info/:invoice_number')
    @UseBefore(CacheGetMiddleware)
    @HttpCode(200)
    public async get_invoice_info(@Param('invoice_number') invoice_number: string) {


        const find_invoice = await this.delivery_tracker.find_invoice(invoice_number);

        const response_invoice = plainToInstance(DeliveryInfoDTO, find_invoice, {
            excludeExtraneousValues: true,
        })
        await validateOrReject(response_invoice);

        return {
            message: "택배 송장 정보 조회 성공",
            data: response_invoice,
        }
    }


    @Get('/tracker/:invoice_number')
    @UseBefore(CacheGetMiddleware)
    @HttpCode(200)
    public async get_invoice_tracker(@Param('invoice_number') invoice_number: string) {

        logger.info("배달 추적");
        const find_trackers = await this.delivery_tracker.track_invoice(invoice_number);

        logger.info("배달 추적 데이터 dto 변환");
        const response_trackers = find_trackers.map((tracker) => plainToInstance(DeliveryTrackDTO, tracker, {
            excludeExtraneousValues: true,
        }))

        logger.info("배달 추적 데이터 검증");
        await Promise.all(response_trackers.map((dto) => validateOrReject(dto)));
        
        logger.info("배달 추적 데이터 검증 완료");
        return {
            message: "택배 추적 정보 조회 성공",
            data: response_trackers,
        }
    }

    @Get('/coords/:invoice_number')
    @UseBefore(CacheGetMiddleware)
    @HttpCode(200)
    public async get_tracker_coords(@Param('invoice_number') invoice_number: string) {

        const find_coords = await this.delivery_tracker.get_coord(invoice_number);

        const response_coords = find_coords.map((coord) => plainToInstance(DeliveryCoordDTO, coord, {
            excludeExtraneousValues: true,
        }))

        await Promise.all(response_coords.map((dto) => validateOrReject(dto)));

        return {
            message: "택배 경로 좌표 조회 성공",
            data: response_coords,

        }
    }

    @Get('/qr_code')
    @HttpCode(200)
    public async get_qr_code(@QueryParam('url') url: string) {
        const change_qr_code = await this.delivery_tracker.get_qrcode_and_s3(url);

        return {
            message: "택배 qr코드 변환 성공",
            data: change_qr_code,
        }

    }

    @Post('/user')
    @HttpCode(201)
    public async create_user_invoice_record(@Body() body: { invoice_number: string }, @Session() session: session.Session & Partial<session.SessionData>, @Res() res: Response, @Req() req: Request) {

        if (!session.user) {
            throw new NotSessionError();
        }

        await this.delivery_tracker.create_my_invoice(session.user.id, body.invoice_number);

        return {
            message: "최근 송장 조회에 추가 성공"
        }




    }


    @Get('/user')
    @HttpCode(200)
    public async get_my_invoice_list(@Session() session: session.Session & Partial<session.SessionData>, @Res() res: Response, @Req() req: Request) {

        if (!session.user) {
            throw new NotSessionError();
        }

        const find_list = await this.delivery_tracker.find_my_invoice_list(session.user.id);

        return {
            message: "내 송장 조회 성공",
            data: find_list,
        }
    }
}
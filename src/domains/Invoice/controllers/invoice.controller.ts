import { Body, Delete, Get, HttpCode, JsonController, Param, Patch, Post, QueryParam, Req, Res, ResponseClassTransformOptions, Session } from "routing-controllers";
import Container, { Inject, Service } from "typedi";
import { Delivery_Tracker } from "../services/delivery_tracker.service";
import session from "express-session";
import { CreateMyInvoiceDTO } from "../dtos/invoice.dto";
import { Response, Request } from 'express';
import { plainToInstance } from "class-transformer";
import { validateOrReject, Validator } from "class-validator";
import { ResponseSocialUserDTO } from "@/domains/user/dtos/social_user.dto";


@Service()
@JsonController('/invoice')
export class InvoiceController {
    constructor(
        // @Inject(() => InvoiceService) private invoiceService: InvoiceService
        @Inject(() => Delivery_Tracker) private delivery_tracker: Delivery_Tracker,
    ) {

    }

    // @Post('/')
    // @HttpCode(201)
    // public async create_invoice(@Body() data: CreateInvoiceDTO) {

    //     const entity: Partial<Invoice> = plainToInstance(Invoice, data);
    //     const new_invoice = await this.invoiceService.create_invoice(entity);

    //     const response_invoice = new ResponseInvoiceDTO(new_invoice);
    //     return {
    //         message: "송장 생성 완료",
    //         data: response_invoice
    //     }
    // }

    // @Delete('/:id')
    // @HttpCode(200)
    // public async delete_invoice(@Param('id') id: number) {

    //     const is_delete_invoice = await this.invoiceService.delete_invoice(id);

    //     return {
    //         message: "송장 제거 완료",
    //         data: is_delete_invoice
    //     }
    // }

    // @Patch('/:id')
    // @HttpCode(200)
    // public async change_invoice(@Body() data: UpdateInvoiceDTO, @Param('id') id: number) {

    //     const enetity: Partial<Invoice> = plainToInstance(Invoice, data);
    //     const update_invoice = await this.invoiceService.change_delivery_status(id, enetity);
    //     const response_invoice = new ResponseInvoiceDTO(update_invoice);

    //     return {
    //         message: "송장 수정 성공",
    //         data: response_invoice,
    //     }
    // }


    // @Get('/user/:user_id/:user_type')
    // @HttpCode(200)
    // public async find_invoices(@Param('user_id') user_id: number, @Param('user_type') user_type: Invoice_User) {

    //     const find_invoices = await this.invoiceService.find_invoices(user_id, user_type);

    //     const response_invoices = find_invoices.map((invoice) => new ResponseInvoiceDTO(invoice));
    //     return {
    //         message: "유저 종류별 송장 조회 성공",
    //         data: response_invoices
    //     }
    // }

    @Get('/info/:invoice_number')
    @HttpCode(200)
    public async get_invoice_info(@Param('invoice_number') invoice_number: string) {

        const find_invoice = await this.delivery_tracker.find_invoice(invoice_number);

        return {
            message: "택배 송장 정보 조회 성공",
            data: find_invoice,
        }
    }


    @Get('/tracker/:invoice_number')
    @HttpCode(200)
    public async get_invoice_tracker(@Param('invoice_number') invoice_number: string) {

        const find_tracker = await this.delivery_tracker.track_invoice(invoice_number);

        return {
            message: "택배 추적 정보 조회 성공",
            data: find_tracker,
        }
    }

    @Get('/coords/:invoice_number')
    @HttpCode(200)
    public async get_tracker_coords(@Param('invoice_number') invoice_number: string) {

        const find_coords = await this.delivery_tracker.get_coord(invoice_number);

        return {
            message: "택배 경로 좌표 조회 성공",
            data: find_coords,

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
    public async create_user_invoice_record(@Body() body: CreateMyInvoiceDTO, @Session() session: session.Session & Partial<session.SessionData>, @Res() res: Response, @Req() req: Request) {

        const sessionId = req.headers.authorization?.split(" ")[1];
        const invoice_numbers = body.invoice_number;

        if (session.user) {
            await this.delivery_tracker.create_my_invoice(session.user.id, invoice_numbers);

            return { message: "최근 송장 조회에 추가 성공" }
        }
        else if (sessionId) {
            const session_data: ResponseSocialUserDTO | null = await new Promise((resolve, reject) => {
                req.sessionStore.get(sessionId, (err, session) => {
                    if (err) {
                        reject(err);
                    }
                    else if (!session)
                        resolve(null);
                    else
                        resolve(session.user);

                })
            })

            if (!session_data) {
                return res.status(401).json({ message: "세션이 유효하지 않음" });
            }

            await this.delivery_tracker.create_my_invoice(session_data.id, invoice_numbers);

            return { message: "최근 송장 조회에 추가 성공" }
        }
        else {
            return res.status(401).json({ message: "세션이 유효하지 않음" });
        }

    }


    @Get('/user')
    @HttpCode(200)
    public async get_my_invoice_list(@Session() session: session.Session & Partial<session.SessionData>, @Res() res: Response, @Req() req: Request) {

        console.log("sessioncookie", session.cookie);
        console.log("session", session);
        console.log("sessionid:", session.id);
        console.log("Request Headers:", req.headers);
        console.log("req.sessionID:", req.sessionID);
        console.log("req.sessionID:", req.session.id);
        console.log("req.session:", req.session);
        console.log("req.cookies:", req.cookies);
        console.log("req.headers.cookie:", req.headers.cookie);


        const sessionId = req.headers.authorization?.split(" ")[1];

        if (session.user) {
            const find_list = await this.delivery_tracker.find_my_invoice_list(session.user.id);

            return {
                message: "내 송장 조회 성공",
                data: find_list,
            }
        }
        else if (sessionId) {
            const session_data: ResponseSocialUserDTO | null = await new Promise((resolve, reject) => {
                req.sessionStore.get(sessionId, (err, session) => {
                    if (err) {
                        reject(err);
                    }
                    else if (!session)
                        resolve(null);
                    else
                        resolve(session.user);

                })
            })

            if (!session_data) {
                return res.status(401).json({ message: "세션이 유효하지 않음" });
            }
            const find_list = await this.delivery_tracker.find_my_invoice_list(session_data.id);

            return {
                message: "내 송장 조회 성공",
                data: find_list,
            }
        }
        else {
            return res.status(401).json({ message: "세션이 유효하지 않음" });
        }
    }
}
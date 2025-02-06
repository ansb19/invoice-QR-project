import { Body, Delete, Get, HttpCode, JsonController, Param, Patch, Post } from "routing-controllers";
import { Inject, Service } from "typedi";
import { InvoiceService } from "../services/invoice.service";
import { CreateInvoiceDTO, ResponseInvoiceDTO, UpdateInvoiceDTO } from "../dtos/invoice.dto";
import { plainToInstance } from "class-transformer";
import { Invoice } from "../entities/invoice.entity";
import { Invoice_User } from "@/common/utils/enum.control";


@Service()
@JsonController('/invoice')
export class InvoiceController {
    constructor(@Inject(() => InvoiceService) private invoiceService: InvoiceService) {

    }

    @Post()
    @HttpCode(201)
    public async create_invoice(@Body() data: CreateInvoiceDTO) {

        const entity: Partial<Invoice> = plainToInstance(Invoice, data);
        const new_invoice = await this.invoiceService.create_invoice(entity);

        const response_invoice = new ResponseInvoiceDTO(new_invoice);
        return {
            message: "송장 생성 완료",
            data: response_invoice
        }
    }

    @Delete()
    @HttpCode(200)
    public async delete_invoice(@Param('id') id: number) {

        const is_delete_invoice = await this.invoiceService.delete_invoice(id);

        return {
            message: "송장 제거 완료",
            data: is_delete_invoice
        }
    }

    @Patch()
    @HttpCode(200)
    public async change_invoice(@Body() data: UpdateInvoiceDTO, @Param('id') id: number) {

        const enetity: Partial<Invoice> = plainToInstance(Invoice, data);
        const update_invoice = await this.invoiceService.change_delivery_status(id, enetity);
        const response_invoice = new ResponseInvoiceDTO(update_invoice);

        return {
            message: "송장 수정 성공",
            data: response_invoice,
        }
    }


    @Get()
    @HttpCode(200)
    public async find_invoices(@Param('user_id') user_id: number, @Param('user_type') user_type: Invoice_User) {

        const find_invoices = await this.invoiceService.find_invoices(user_id, user_type);

        const response_invoices = find_invoices.map((invoice) => new ResponseInvoiceDTO(invoice));
        return {
            message: "유저 종류별 송장 조회 성공",
            data: response_invoices
        }
    }
}
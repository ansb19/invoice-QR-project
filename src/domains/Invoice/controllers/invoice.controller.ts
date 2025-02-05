import { Body, HttpCode, JsonController, Post } from "routing-controllers";
import { Inject, Service } from "typedi";
import { InvoiceService } from "../services/invoice.service";
import { CreateInvoiceDTO } from "../dtos/invoice.dto";
import { plainToInstance } from "class-transformer";
import { Invoice } from "../entities/invoice.entity";


@Service()
@JsonController('/invoice')
export class InvoiceController {
    constructor(@Inject(() => InvoiceService) private invoiceService: InvoiceService) {

    }

    @Post()
    @HttpCode(201)
    public async create_invoice(@Body() invoice: CreateInvoiceDTO) {

        const entity: Partial<Invoice> = plainToInstance(Invoice, invoice);
        //const new_invoice = await this.invoiceService.create_invoice(entity);

        return {

        }
    }
}
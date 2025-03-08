import { IsNotEmpty, IsString, Length } from "class-validator";
import { Service } from "typedi";


@Service()
export class CreateMyInvoiceDTO{

    invoice_number!: string;
}
import { BaseRepository } from "@/common/abstract/base.repository";
import { Invoice } from "../entities/invoice.entity";
import { Inject, Service } from "typedi";
import { Database } from "@/config/database/Database";

@Service()
export class InvoiceRepository extends BaseRepository<Invoice> {
    constructor(@Inject(() => Database) readonly database: Database) {
        super(Invoice, database);
    }
}
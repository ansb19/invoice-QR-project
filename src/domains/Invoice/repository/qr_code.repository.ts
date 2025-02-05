import { BaseRepository } from "@/common/abstract/base.repository";
import { QR_Code } from "../entities/qr_code.entity";
import { Inject, Service } from "typedi";
import { Database } from "@/config/database/Database";

@Service()
export class QR_CodeRepository extends BaseRepository<QR_Code>{
    constructor(@Inject(()=> Database) readonly database: Database){
        super(QR_Code, database);
    }
}
import { BaseRepository } from "@/common/abstract/base.repository";
import { Inject, Service } from "typedi";
import { CJ_Terminal } from "../entities/cj_terminal.entity";
import { Database } from "@/config/database/Database";
import { QueryRunner } from "typeorm";
import { NotFoundError } from "@/common/exceptions/app.error";

@Service()
export class CJ_TerminalRepository extends BaseRepository<CJ_Terminal> {
    constructor(@Inject(() => Database)  readonly database: Database) {
    super(CJ_Terminal, database);
    }

    public async get_terminal(code: string, queryRunner?: QueryRunner): Promise<CJ_Terminal| null>{

        const cj_terminal = await this.getRepository(queryRunner)
        .createQueryBuilder('cj_terminal')
        .where('cj_terminal.name ILIKE :name',{name: `%${code}%`})
        .getOne();
        
        if(!cj_terminal) {
            return null;
        }
        return cj_terminal;
    }
}
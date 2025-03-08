import { MigrationInterface, QueryRunner } from "typeorm";
import { cj_delivery_terminal } from "../cj_terminal_data";

export class CJTerminalInitData1740444906371 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.manager.save("CJ_TERMINAL",cj_delivery_terminal )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.manager.save("CJ_TERMINAL",cj_delivery_terminal )
    }
}

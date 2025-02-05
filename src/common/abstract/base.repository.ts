import { Database } from "@/config/database/Database";
import { Inject } from "typedi";
import { DeepPartial, ObjectLiteral, QueryRunner, Repository } from "typeorm";
import { logger } from "../logging/logger";
import { DatabaseError, NotFoundError } from "../exceptions/app.error";


export abstract class BaseRepository<T extends ObjectLiteral> {
    protected repository: Repository<T>;

    constructor(entity: new () => T, @Inject(() => Database) database: Database) {
        const dataSource = database.postgres_dataSource;
        this.repository = dataSource.getRepository(entity);
    }

    protected getRepository(queryRunner?: QueryRunner): Repository<T> {
        return queryRunner && !queryRunner.isReleased
            ? queryRunner.manager.getRepository<T>(this.repository.target) // if true transaction ON
            : this.repository; //  else false transaction OFF (normal)
    }


    public async create(data: DeepPartial<T>, queryRunner?: QueryRunner): Promise<T> {
        try {
            const repo = this.getRepository(queryRunner);
            const entity = repo.create(data);
            const save_entity = await repo.save(entity);
            //            logger.info(`Entity created successfully: ${JSON.stringify(save_entity)}`);
            return save_entity;
        } catch (error) {
            const cause = error instanceof Error ? error : new Error(String(error));
            throw new DatabaseError(`${this.constructor.name}.${this.create.name} - Entity:${this.repository.target}`, cause);
        }
    }

    public async read_all(condition?: Partial<T>, relations?: string[], queryRunner?: QueryRunner): Promise<T[]> {
        try {
            const repo = this.getRepository(queryRunner);
            const entities = await repo.find({
                where: condition,
                relations: relations,
            });
            // logger
            return entities;
        } catch (error) {
            const cause = error instanceof Error ? error : new Error(String(error));
            throw new DatabaseError(`${this.constructor.name}.${this.read_all.name} - Entity:${this.repository.target}`, cause);
        }
    }

    public async read_one(condition: Partial<T>, relations?: string[], queryRunner?: QueryRunner): Promise<T | null> {
        try {
            const repo = this.getRepository(queryRunner);
            const entity = await repo.findOne({
                where: condition,
                relations: relations,
            });
            if (!entity)
                return null;
            return entity;
        } catch (error) {
            const cause = error instanceof Error ? error : new Error(String(error));
            throw new DatabaseError(`${this.constructor.name}.${this.read_one.name} - Entity:${this.repository.target}`, cause);
        }
    }

    public async update(condition: Partial<T>, data: DeepPartial<T>, queryRunner?: QueryRunner): Promise<T> {
        try {
            const repo = this.getRepository(queryRunner);
            const entity = await repo.findOneBy(condition);
            if (!entity) {
                throw new NotFoundError(`수정할 데이터를 찾을 수 없습니다: ${JSON.stringify(condition)}`);
            }
            repo.merge(entity, data);
            const updated_entity = await repo.save(entity);
            return updated_entity;
        } catch (error) {
            const cause = error instanceof Error ? error : new Error(String(error));
            throw new DatabaseError(`${this.constructor.name}.${this.update.name} - Entity:${this.repository.target}`, cause);
        }
    }

    public async delete(condition: Partial<T>, queryRunner?: QueryRunner): Promise<boolean> {

        try {
            const repo = this.getRepository(queryRunner);
            const result = await repo.delete(condition);
            if (result.affected === 0)
                throw new NotFoundError(`삭제제할 데이터를 찾을 수 없습니다: ${JSON.stringify(condition)}`);
            else
                return true;
        } catch (error) {
            const cause = error instanceof Error ? error : new Error(String(error));
            throw new DatabaseError(`${this.constructor.name}.${this.delete.name} - Entity:${this.repository.target}`, cause);
        }
    }

} 
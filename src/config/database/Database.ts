
import { Inject, Service } from "typedi";
import { DataSource } from "typeorm";
import { logger } from "@/common/logging/logger";
import { DatabaseError } from "@/common/exceptions/app.error";
import { DatabaseConfig } from "./db_option";




@Service()
export class Database {
    readonly postgres_dataSource: DataSource;
    // 만약에 다른 곳 db 추가하면 여기 추가
    constructor(@Inject(() => DatabaseConfig) private options: DatabaseConfig) {
        this.postgres_dataSource = new DataSource(this.options.getPostgresOption()); 
        // 만약에 다른 곳 db 추가하면 여기 추가
    }

    /**
     * 데이터베이스 초기화 메서드
     */
    public async initialize(): Promise<void> {
        try {
            if (!this.postgres_dataSource.isInitialized) {
                logger.info("Initializing database connection...");
                await this.postgres_dataSource.initialize();
                // 만약에 다른 곳 db 추가하면 여기 추가
                logger.info("Database initialized successfully.");
            }
            else {
                logger.warn("Database connection is already initialized.");
            }
        } catch (error) {
            
            throw new DatabaseError("데이터베이스 초기화 실패", error as Error);
        }

    }
    /**
     * 마이그레이션 실행 메서드
     */
    public async runMigrations(): Promise<void> {
        try {
            logger.info("Running database migrations...");
            await this.postgres_dataSource.runMigrations();
            // 만약에 다른 곳 db 추가하면 여기 추가
            logger.info("Database migrations completed successfully.");
        } catch (error) {
            throw new DatabaseError("마이그레이션 실행 실패", error as Error);
        }
    }
    /**
     * 데이터베이스 연결 종료 메서드
     */
    public async close(): Promise<void> {
        try {
            if (this.postgres_dataSource.isInitialized) {
                logger.info("Closing database connection...");
                await this.postgres_dataSource.destroy();
                logger.info("Database connection closed successfully.");
            } else {
                logger.warn("Database connection is already closed.");
            }
            // 만약에 다른 곳 db 추가하면 여기 추가
        } catch (error) {
            throw new DatabaseError("데이터베이스 연결 종료 실패", error as Error);
        }
    }


}

import mysql2 from 'mysql2/promise';
import dotenv from 'dotenv';

export class QR_DAO {
    constructor(){
        dotenv.config();
        try{
            this.pool = mysql2.createPool({
                host: process.env.DATABASE_HOSTNAME,
                user: process.env.DATABASE_USER,
                password: process.env.DATABASE_PASSWORD,
                database: process.env.DATABASE_SCHEMA,
                port: process.env.DATABASE_PORT,
                waitForConnections: true,
                connectionLimit: 10, 
                maxIdle: 10,                   
                idleTimeout: 60000,
                queueLimit: 0,
                enableKeepAlive: true,
                keepAliveInitialDelay: 0
            });
            console.log("Connected to database pool");
        }
        catch(err){
            console.err('database connection is problem: ' + err.stack);
            throw err;
        }
    }

    async transaction(sqls, values){
        let conn = null;
        try{
            conn = await this.pool.getConnection();
            await conn.beginTransaction();

            let result, field = null;
            for(const sql of sqls){
                if(!values){
                    [result, field] = await conn.execute(sql);
                }
                else{
                    [result, field] = await conn.execute(sql, values);
                }
            }

            await conn.commit();
            return result;
        }

        catch(err){
            if (!conn){
                throw new Error("Connection is NULL");
            }
            await conn.rollback();
            console.error("transaction error: "+ err.stack);
            return null;
        }

        finally{
            if (conn){
                conn.release();
            }
        }
    }

    async create_qrcode(url, invoice_number, qr_code_image){ // crud
        try{
            let sql = `insert into QR_code( Url, Invoice_number, QR_code_image) values (?,?,?);`;
            let values = [url, invoice_number, qr_code_image];

            const result = await this.transaction([sql],values);
            console.log(
                `${url}의 코드 생성.. Number of records insert: ${result.affectedRows}`
            );
        }
        catch (err){
            console.error("database query [create_qrcode] is problem: "+ err.stack)
            throw err;
        }
    }

    async read_qrcode(){

    }

    async delete_qrcode(){

    }
}

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

    async create_qrcode(url, invoice_number, qr_code_image){ // qr 저장
        try{
            let sql = `insert into QR_code( Url, Invoice_number, QR_code_image) values (?,?,?);`;
            let values = [url, invoice_number, qr_code_image];

            const result = await this.transaction([sql],values);
            console.log(
                `${url}의 QR 생성.. Number of records insert: ${result.affectedRows}`
            );
        }
        catch (err){
            console.error("database query [create_qrcode] is problem: "+ err.stack)
            throw err;
        }
    }

    async read_qrcode(invoice_number){ //qr 조회
        try{
            let sql = `select QR_code_image from QR_code where Invoice_number = ?;`;
            let values = [invoice_number];

            const [result] = await this.transaction([sql],values);
            return result;
            
        }
        catch (err){
            console.error("database query [read_qrcode] is problem: "+ err.stack)
            throw err;
        }
    }

    async delete_qrcode(invoice_number){ // qr 삭제
        try{
            let sql = `delete from QR_code where Invoice_number = ?;`;
            let values = [invoice_number];

            const result = await this.transaction([sql],values);
            console.log(
                `${invoice_number}의 QR 삭제.. Number of records insert: ${result.affectedRows}`
            );
        }
        catch (err){
            console.error("database query [delete_qrcode] is problem: "+ err.stack)
            throw err;
        }
    }
}

import mysql2 from 'mysql2/promise';
import dotenv from 'dotenv';

export class CHAT_DAO {
    constructor() {
        dotenv.config();
        try {
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
        catch (err) {
            console.err('database connection is problem: ' + err.stack);
            throw err;
        }
    }

    async transaction(sqls, values) {
        let conn = null;
        try {
            conn = await this.pool.getConnection();
            await conn.beginTransaction();

            let result, field = null;
            for (const sql of sqls) {
                if (!values) {
                    [result, field] = await conn.execute(sql);
                }
                else {
                    [result, field] = await conn.execute(sql, values);
                }
            }

            await conn.commit();
            return result;
        }

        catch (err) {
            if (!conn) {
                throw new Error("Connection is NULL");
            }
            await conn.rollback();
            console.error("transaction error: " + err.stack);
            return null;
        }

        finally {
            if (conn) {
                conn.release();
            }
        }
    }

    async create_chatroom(Invoice_number, Sender_name, Receiver_name, Delivery_name) { //채팅방 만들기
        try {
            let sql = `insert into CHAT_LIST(Invoice_number, Sender_name, Receiver_name, Delivery_name) values(?,?,?,?);`;
            let values = [Invoice_number, Sender_name, Receiver_name, Delivery_name];

            const result = await this.transaction([sql], values);
            console.log(`${Invoice_number}의 채팅방 이름 생성.. ${result.affectedRows}`);
        }
        catch (err) {
            console.error("database query [create_chatroom] is problem: " + err.stack)
            throw err;
        }
    }

    async store_message(Invoice_number, user_name, message, time) { //메세지 저장
        try {
            let sql = `insert into CHAT(Invoice_number, user_name, message, time) values(?,?,?,?);`;
            let values = [Invoice_number, user_name, message, time];

            const result = await this.transaction([sql], values);
            console.log(`${user_name}이 채팅 ${message} 입력 .. ${result.affectedRows}`);
        }
        catch (err) {
            console.error("database query [store_message] is problem: " + err.stack)
            throw err;
        }
    }

    async reload_message(Invoice_number, user_name, message, time) { // 메시지 전부 불러오기
        try {
            let sql = `select CHAT(Invoice_number, user_name, message, time) values (?,?,?,?);`;
            let values = [Invoice_number, user_name, message, time];

            const result = await this.transaction([sql], values);
            return result;
        }
        catch(err){
            console.error("database query [reload_message] is problem: " + err.stack)
            throw err;
        }
    }


}

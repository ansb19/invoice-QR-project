import mysql2 from "mysql2/promise";
import dotenv from "dotenv";

export class USER_DAO { // 유저 테이블 관련 데이터 베이스 처리 하는 곳
    constructor() {
        // 초기 생성자
        dotenv.config(); // dotnev 파일을 config하여 불러옴
        try {
            this.pool = mysql2.createPool({
                //connection pool 생성을 위해 아래의 정보를 토대로 pool 생성
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
                keepAliveInitialDelay: 0,
            });

            console.log("Connected to database pool");
        } catch (err) {
            console.err("database conncetion is problem: " + err.stack);
            throw err;
        }
    }

    async transaction(sqls, values) {
        // transaction 단위로 수행하기위해 함수로 따로 작성
        let conn = null;
        try {
            conn = await this.pool.getConnection(); // pool을 통해 connection을 할당받음
            await conn.beginTransaction(); // transaction 시작

            let result, field = null;
            for (const sql of sqls) {
                //여러 sql문을 받아 transaction 단위로 처리하기 위해 for문 사용
                if (!values) {
                    // values 값이 없으면 값이 없는 쿼리문 실행
                    [result, field] = await conn.execute(sql);
                } else {
                    //console.log(values); // ?????????????????????????
                    [result, field] = await conn.execute(sql, values);
                }
            }
            await conn.commit();
            return result;

        } catch (err) {
            if (!conn) {
                throw new Error("Connection is NULL");
            }
            await conn.rollback(); // 이전으로 롤백
            console.error("transaction error: " + err.stack);
            return null;
        } finally {
            if (conn) {
                conn.release();
            }
        }
    }

    async create_invoice(sender_id, receiver_id, delivery_man_id, delivery_item, receiver_comment) { // sender 와 receiver, delivery man의 정보를 받아옴
        try {
            let sql =
                `insert into INVOICE( Sender_id, Receiver_id, Delivery_man_id, Delivery_item, Receiver_comment, create_at) values ( ?, ?, ?, ?, ?, now());`;
            let values = [sender_id, receiver_id, delivery_man_id, delivery_item, receiver_comment];

            const result = await this.transaction([sql], values);
            console.log(
                `송장 생성 완료.. Number of records insert: ${result.affectedRows}`
            );
        }
        catch (err) {
            console.error("database query [create_invoice] is problem: " + err.stack);
            throw err;
        }
    }

    async change_delivery_user(invoice_number, user_type, user_id) { //바꿀 송장번호, 유저 타입(sender,receiver,delivery_man), 유저 아이디
        try {
            let sql;
            switch (user_type) {
                case 'Sender':
                    sql = `update INVOICE set ${user_type}_id = ${user_id} where Invoice_number = ${invoice_number};`;
                    break;

                case 'Receiver':
                    sql = `update INVOICE set ${user_type}_id = ${user_id} where Invoice_number = ${invoice_number};`;
                    break;

                case 'Delivery_man':
                    sql = `update INVOICE set ${user_type}_id = ${user_id} where Invoice_number = ${invoice_number};`;
            }
            const result = await this.transaction([sql]);
            console.log(
                `송장번호: ${invoice_number}인 ${user_id}의 타입을 ${user_type}으로 변경완료..
                records : ${result.affectedRows}`
            );

        }
        catch(err){
            console.error("database query [change_delivery_user] is problem: "+ err.stack);
            err.stack;
        }
  }

  
}


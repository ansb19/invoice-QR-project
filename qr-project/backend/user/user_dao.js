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

      let result,
        field = null;
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

  async sign_up(id, password, name, email, email_cert_number, phone, address, zipcode, grade) {
    //회원가입
    try {
      let sql =
        "insert into USER(id, password, name, email, email_cert_number, phone, address, zipcode, grade) values (?,?,?,?,?,?,?,?,?);";
      let values = [id, password, name, email, email_cert_number, phone, address, zipcode, grade];

      const result = await this.transaction([sql], values);
      console.log(
        `${id}의 회원가입.. Number of records insert: ${result.affectedRows}`
      );
    } catch (err) {
      console.error("database query [sign_up] is problem: " + err.stack);
      throw err;w
    }
  }

  async sign_in(id, password) {
    //로그인
    try {
      let sql = "select count(*) from user where id = ? and password = ?;";
      let values = [id, password];
      const [result] = await this.transaction([sql], values);
      return result; // 1이면 성공 0이면 실패
    } catch (err) {
      console.error("database query [sign_in] is problem: " + err.stack);
      throw err;
    }
  }

  async find_id(email) {
    // 아이디 찾기
    let sql =
      "select replace(id, substr(id,3,2),'**' ) from user where email = ?;";
    let values = [email];
    const [result] = await this.transaction([sql], values);
    return result;
  }

  async find_password(id, email) {
    //비밀번호 찾기 - 이메일 아이디 입력 시 비밀번호 유무 체크
    let sql = "select count(password) from user where id = ? and email = ?;";
    let values = [id, email];
    const [result] = await this.transaction([sql], values);
    return result; // 1 이면 비밀번호 맞음 0 이면 아이디나 비밀번호 틀림
  }

  async change_password(id, password) {
    //비밀번호 변경
    let sql = "update user set password = ? where id = ?;";
    let values = [password, id];
    const [result] = await this.transaction([sql], values);
    console.log(
      `${id}의 비밀번호 변경.. Number of records insert: ${result.affectedRows}`
    );
  }

  async user_access_change(grade_status, id) {
    // 유저 권한 변경 / 0은 일반 사용자 1은 택배원 2는 관리자
    let sql = "update user set grade_status = ? where id = ?;";
    let values = [grade_status, id];
    const [result] = await this.transaction([sql], values);
    console.log(
      `${id}의 유저 권한 변경.. Number of records insert: ${result.affectedRows}`
    );
  }

  async user_select() {
    // 유저 조회
    let sql =
      "select id,name,email, grade_status from user where grade_status = 0 or grade_status = 1;";
    const [result] = await this.transaction([sql]);
    return result;
  }

  async user_search(keyword) {
    // 유저 찾기
    let sql =
      "select id, name,email, grade_status from user where (grade_status = 0 or grade_status = 1) and (id like '%?%' or name like '%?%' or email like '%?%');";
    let id, name, email;
    (id = keyword), (name = keyword), (email = keyword);

    let values = [id, name, keyword];
    const [result] = await this.transaction([sql], values);
    return result;
  }

  async email_cert_create(id, email_cert_number) {
    //이메일 인증번호 - 생성
    let sql = "update user set email_cert_number = ? where id = ?;";
    let values = [email_cert_number, id];
    const [result] = await this.transaction([sql], values);
    console.log(
      `${id}의 인증번호 생성.. Number of records insert: ${result.affectedRows}`
    );
  }

  async email_cert_read(id) {
    //이메일 인증번호 - 읽기
    let sql = "select email_cert_number from user where id = ?;";
    let values = [id];
    const [result] = await this.transaction([sql], values);
    return result; // 인증번호를 반환
  }

  async change_verified_user(id) {
    //이메일 인증 완료
    let sql = "update user set verified_user = 1 where id = ?;";
    let values = [id];
    const [result] = await this.transaction([sql], values);
    console.log(
      `${id}의 이메일 인증왼료.. Number of records insert: ${result.affectedRows}`
    );
  }

  async email_cert_delete(id) {
    //이메일 인증번호 - 삭제
    let sql = "update user set email_cert_number = null where id = ?;";
    let values = [id];
    const [result] = await this.transaction([sql], values);
    console.log(
      `${id}의 인증번호 삭제.. Number of records insert: ${result.affectedRows}`
    );
  }
}

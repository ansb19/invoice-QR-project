import { USER_DAO } from "../user/user_dao.js"
import { EmailService } from "../user/send_mail.js"
import { USER } from "../user/user.js";
import { PassHash } from "./pass_hash.js";
import { SENDSMS } from "./send_sms.js";


export class USER_SERVICE {
    constructor() {
        this.user = new USER();
        this.userDAO = new USER_DAO();
        this.emailservice = new EmailService();
        this.passhash = new PassHash();
        this.sendsms = new SENDSMS();
    }

    number_create() { // 6자리 랜덤 숫자 생성
        return Math.floor(Math.random() * 900000) + 100000;
    }



    async sign_up(id, password, name, email, phone, address, zipcode, grade) {

        const email_cert_number = this.number_create();
        const subject = "Welcome your sign up!";
        const text = `Hello ${name} Welcome to the Delivery QR
            I'm glad your signing up. here is your
            ${email_cert_number}
            
            have a good day!`;

        this.user.id = id;


        this.user.password = await this.passhash.hashPassword(password);

        this.user.name = name;
        this.user.email = email;
        this.user.email_cert_number = email_cert_number;
        this.user.phone = phone;
        this.user.address = address;
        this.user.zipcode = zipcode;
        this.user.grade = grade;


        await this.emailservice.sendMail(email, subject, text, null);

        await this.userDAO.sign_up(
            this.user.id,
            this.user.password,
            this.user.name,
            this.user.email,
            this.user.email_cert_number,
            this.user.phone,
            this.user.address,
            this.user.zipcode,
            this.user.grade
        );

    } // sign_up 함수가 실행되면 6자리 랜덤 수 생성 후 이메일 전송 후 db에 해당 난수를 넣음



    async email_cert(id, email_cert_number) { //이메일 인증
        const db_email_cert_number = await this.userDAO.email_cert_read(id);

        console.log(db_email_cert_number);
        console.log(email_cert_number);
        if (email_cert_number == db_email_cert_number) {
            await this.userDAO.change_verified_user(id);
            console.log(`인증 성공`);
            return true;
        }
        else {
            console.log(`인증 실패`);
            return false;
        }
    }

    async find_id(email) {
        var result = await this.userDAO.find_id(email);
        return result;
    }


    async login(id, password) {
        var dbpassword = await this.userDAO.sign_in(id);

        console.log(password, dbpassword.password);
        if (await this.passhash.verifyPassword(password, dbpassword.password)) {
            return true;
        }
        else {
            return false;
        }
    }

    async check_duplicate_id(id) {
        var check = await this.userDAO.check_duplicate_id(id);
        //console.log(check.count, check);
        if (check.count == 0) {
            return true; // 아이디 없음
        }
        else {
            return false; //아이디 있음
        }
    }

    async find_name(id) {
        var name = await this.userDAO.find_name(id);
        return name;
    }

    async phone_cert(phone) {
        var cert_number = this.number_create();
        var text =
            `invoice QR 인증번호는 ${cert_number} 입니다.`;
        await this.sendsms.send_sms(phone, text);
        return cert_number;
    }

    async address_search() {
        const confmKey = `${process.env.ADDRESS_API}=`; // 실제 승인키로 교체해야 함
        const returnUrl = encodeURIComponent(`${process.env.FRONT_END_API_URL}/address`);
        const resultType = "4";

        const formData = new URLSearchParams();
        formData.append('confmKey', confmKey);
        formData.append('returnUrl', returnUrl);
        formData.append('resultType', resultType);

        return formData;
    }
}

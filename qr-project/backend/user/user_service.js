import { USER_DAO } from "../user/user_dao.js"
import { EmailService } from "../user/send_mail.js"
import { USER } from "../user/user.js";

export class USER_SERVICE {
    constructor() {
        this.user = new USER();
        this.userDAO = new USER_DAO();
        this.emailservice = new EmailService();
    }

    async sign_up(id, password, name, email, phone, address, zipcode, grade) {

        const email_cert_number = this.number_create();
        const subject = "Welcome your sign up!";
        const text = `Hello ${name} Welcome to the Delivery QR
            I'm glad your signing up. here is your
            ${email_cert_number}
            have a good day!`;

        this.user.id = id;
        this.user.password = password;
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

        if (email_cert_number === db_email_cert_number) {
            await this.userDAO.change_verified_user(id);
            return true;
        }
        else {
            return false;
        }
    }

    number_create() { // 6자리 랜덤 숫자 생성
        return Math.floor(Math.random() * 900000) + 100000;
    }
}

import { USER_DAO } from "./user_dao.js"
import { EmailService } from "./send_mail.js"
import { USER } from "./user.js";

export class USER_SERVICE {
    constructor() {
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


        this.user.email_cert_number = email_cert_number; //set
        console.log(this.user.email_cert_number);
        this.user.id = id; //set

        await this.emailservice.sendMail(email, subject, text, null);

        await this.userDAO.sign_up(id, password, name, email, email_cert_number, phone, address, zipcode, grade);
        
    } // sign_up 함수가 실행되면 6자리 랜덤 수 생성 후 이메일 전송 후 db에 해당 난수를 넣음



    async email_cert(email_cert_number) { //이메일 인증

//        if (email_cert_number.equal(this.user.email_cert_number())) {
        const number = await this.userDAO.email_cert_read(this.user.id);
        if (email_cert_number.equal(number)) {
            await this.userDAO.change_verified_user(this.user.id);
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

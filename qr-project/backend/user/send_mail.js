import nodemailer from "nodemailer";
import dotenv from "dotenv";

export class EmailService{ // 메일을 보내는 클래스
    constructor(){
        dotenv.config();
        this.transportation = nodemailer.createTransport({
            service: "naver",
            host: "smtp.naver.com", // SMTP 서버명
            port: 465, // SMTP 포트
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    async sendMail(receiver_email, subject, text, html){
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: receiver_email,
            subject: subject,
            text: text,
            html: html
        }

        try{
            let info = await this.transportation.sendMail(mailOptions);
            console.log("Email sent: "+ info.response);
            return info;
        }
        catch(error){
            console.log("ERROR OCCURED: "+ error.messsage);
            throw error;
        }
    }
}


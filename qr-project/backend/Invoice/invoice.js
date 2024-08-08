import QRcode from 'qrcode';
import { QR_DAO } from '../QR_code/qr_dao.js';

export class INVOICE {
    constructor(url) {
        this.url = url;
    }
    async create_qr() {
        const qrcode = await QRcode.toDataURL(this.url); // str
        const qrcode2 = await QRcode.toString(this.url); // image
        this.qrDAO = new QR_DAO();
        console.log(this.url);
        console.log(this.qrcode);
        await this.qrDAO.create_qrcode(this.url, 123, qrcode);
        console.log("qrcode 생성 완료");
    }
}

var test = new INVOICE("https://www.naver.com/");

await test.create_qr();
import express from 'express';
import { USER_SERVICE } from '../user/user_service.js';
import axios from 'axios';

const router = express.Router();
const userService = new USER_SERVICE();

const sessionChecker = (req, res, next) => {
    if (req.session.sid && Date.now() - req.session.loggedtime <= 1000 * 60 * 30) {
        next(); //세션이 존재하고 30분 안지났을때
    }
    else {
        // 세션이 만료
        res.status(401).json({ message: `세션이 종료되었습니다. 다시 로그인해주세요` });
    }
}

router.use((req, res, next) => { //
    console.log(req.path);
    if (req.path === '/login' || req.path === '/sign-up' || req.path === '/' || req.path === '/session' || req.path === '/check-id'
        || req.path === '/send-otp' || req.path === '/verify-otp' || req.path === '/get-address'
    ) {
        next();
    }
    else {
        sessionChecker(req, res, next);
    }
})



// 회원가입 처리
router.post('/sign-up', async (req, res) => {
    try {
        console.log("Sign-up request received:", req.body);
        const { id, password, name, email, phone, address, zipcode, grade } = req.body;

        // 사용자 등록
        await userService.sign_up(id, password, name, email, phone, address, zipcode, grade);

        // 이메일 인증을 위해 세션에 이메일 저장
        req.session.sid = id;
        req.session.semail = email;

        console.log(`이메일 세션 생성 완료: ${req.session.semail}`);
        res.status(200).send("이메일 인증을 해야합니다.");
    } catch (error) {
        console.error("Error during sign-up:", error);
        res.status(500).send("Error occurred during sign-up");
    }
});

// 이메일 가져오기 엔드포인트
router.get('/get-email', (req, res) => {
    try {
        //console.log("Session object:", req.session); // 전체 세션 객체 로그 출력
        if (req.session.semail) {
            res.status(200).json({ email: req.session.semail });
        } else {
            console.log("세션이 없습니다");
            res.status(404).send('Email not found in session 세션 못찾았어 임마');
        }
    }
    catch (error) {
        console.error("Error during get-email:", error);
        res.status(500).send("Error occurred during get-email");
    }
});

// 이메일 인증 처리
router.post('/email-cert', async (req, res) => {
    try {
        console.log("Email certification request received:", req.body);
        const { email_cert_number } = req.body;

        // 세션에서 이메일 가져오기
        const email = req.session.semail;
        const id = req.session.sid;
        console.log(`email: ${email} email_cert_number: ${email_cert_number}`);
        // 이메일 인증 처리
        const isVerified = await userService.email_cert(id, email_cert_number);

        if (isVerified) {
            res.status(200).send('Email verified successfully');
            // 인증 후 세션에서 이메일 제거
            //req.session.email = null;
        } else {
            res.status(400).send('Wrong code');
        }
    } catch (error) {
        console.error("Error during email certification:", error);
        res.status(500).send("Error occurred during email-cert");
    }
});

// 아이디 찾기
router.post('/find_id', async (req, res) => {
    try {
        console.log("Email certification request received:", req.body);
        const { written_email } = req.body;

        // 이메일 인증 처리
        const result = await userService.find_id(written_email);
        res.status(200).json({ result });

    } catch (error) {
        console.error("Error during find id:", error);
        res.status(500).send("Error occurred during find_id");
    }
});

// 로그인 값 검증
router.post('/login', async (req, res) => {
    try {
        const { id, password } = req.body;
        let result = await userService.login(id, password);
        console.log(result);

        if (result) {
            req.session.sid = id;
            req.session.loggedtime = Date.now();
            req.session.sname = await userService.find_name(id);

            console.log(req.session.sid, req.session.loggedtime, req.session.sname);
        }
        res.status(200).json({ result });
    }
    catch (err) {
        console.error(`Error during post login: ${err}`);
    }
});


//로그아웃
router.post('/logout', async (req, res) => {
    try {
        req.session.destroy(err => {
            if (err) {
                return res.status(500).send('Error during logout');
            }
            res.status(200).json({ message: '성공적으로 로그아웃 되었습니다.' });
        });
    }
    catch (error) {
        console.error("Error during logout:", error);
        res.status(500).send("Error occurred during logout");
    }
});

//아이디 중복확인
router.post('/check-id', async (req, res) => {
    try {
        const { id } = req.body;
        let ischecked = await userService.check_duplicate_id(id);
        console.log(id, ischecked);
        res.status(200).json({ isDuplicate: ischecked });
    }
    catch (error) {
        console.error("Error during check-id:", error);
        res.status(500).send("Error occurred during check-id");
    }

})

// ㅇㅇ님 보이게 하는 이름 확인용
router.get('/session', async (req, res) => {
    try {
        if (req.session.sname) {
            console.log(req.session);
            var sname = req.session.sname;
            console.log(sname);
            res.status(200).json(sname); // name : `~~' 형태로 들어감
        }
        else {
            console.log("세션이 없습니다 아이디에 로그인해주세요");
            res.status(400).send("/session에 세션 없대요 아이디 로그인해주세요");
        }
    }
    catch (error) {
        console.error("Error during session:", error);
        res.status(500).send("Error occurred during session");
    }
})

// 휴대폰 번호로 인증 번호 전송
router.post('/send-otp', async (req, res) => {
    try {
        const { phone } = req.body;
        var cert_number = await userService.phone_cert(phone);
        req.session.phone_cert_number = cert_number;
        req.session.phone_certed_time = Date.now();
        console.log(req.session.phone_cert_number, req.session.phone_certed_time);
        res.status(200).send("인증 번호가 전송되었습니다");
    }
    catch (error) {
        console.error("Error during send-otp:", error);
        res.status(500).send("Error occurred during send-otp");
    }
})

//휴대폰 인증번호 검증 
router.post('/verify-otp', async (req, res) => {
    try {
        const { otp } = req.body;
        console.log(req.session.phone_cert_number, req.session.phone_certed_time);
        if (req.session.phone_cert_number && Date.now() - req.session.phone_certed_time <= 1000 * 60 * 5) {
            //5분 안지났을때

            if (otp == req.session.phone_cert_number) {
                res.status(200).json({ code: 0 }); // 인증성공
            }
            else {
                res.status(200).json({ code: 1 });
                //인증 번호가 틀립니다.
            }
        }
        else {
            res.status(200).json({ code: 2 });
            //인증번호 시간이 만료되었습니다 다시 인증번호를 전송해주세요.
        }
    }
    catch (err) {
        console.error("Error during verify-otp:", err);
        res.status(500).send("Error occurred during verify-otp");
    }
})

router.post('/get-address', async (req, res) => {
    try {
        const formdata = await userService.address_search();
        const response = await axios.post('http://business.juso.go.kr/addrlink/addrLinkUrl.do?',formdata, {withCredentials: true});
        res.status(200).send(response.data);
    }
    catch (err) {
        console.error("Error during get-address:", err);
        res.status(500).send("Error occurred during get-address");
    }
})
export default router;

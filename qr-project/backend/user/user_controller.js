import express from 'express';
import { USER_SERVICE } from '../user/user_service.js';

const router = express.Router();
const userService = new USER_SERVICE();

router.post('/sign-up', async (req, res) => {
    try {
        console.log("Sign-up request received:", req.body);
        const { id, password, name, email, phone, address, zipcode, grade } = req.body;
        await userService.sign_up(id, password, name, email, phone, address, zipcode, grade);
        req.session.email = email;
        res.status(200).send("You should verify your email");
    } catch (error) {
        console.error("Error during sign-up:", error);
        res.status(500).send("Error occurred during sign-up");
    }
});

router.post('/email-cert', async (req, res) => {
    try {
        console.log("Email certification request received:", req.body);
        const { id, email_cert_number } = req.body; // ID는 세션에서 가져올 수 있음
        const isVerified = await userService.email_cert(id, email_cert_number);
        if (isVerified) {
            res.status(200).send('Email verified successfully');
        } else {
            res.status(400).send('Wrong code');
        }
    } catch (error) {
        console.error("Error during email certification:", error);
        res.status(500).send("Error occurred during email-cert");
    }
});

export default router;

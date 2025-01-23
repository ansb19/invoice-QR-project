import express from 'express';
import session from 'express-session';
import userRouter from './user/user_controller.js';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import {Server} from 'socket.io';

dotenv.config();

let cors_option = {
    origin: process.env.FRONT_END_API_URL,
    methods: ['GET', 'POST'],
    credentials: true
};

const app = express();
const port = process.env.PORT || 3000;

const server = http.createServer(app);
const io = new Server(server,cors(cors_option))



const maxAge = 1000 * 60 * 30;

let session_option = {
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: true,
    saveUninitialized: true,
    cookie: {  secure: false, maxAge }, // 프로덕션 환경에서는 HTTPS 사용
    rolling: true
};

// 미들웨어 설정 순서
app.use(cors(cors_option)); // CORS 설정
app.use(session(session_option)); // 세션 설정
app.use(express.json()); // JSON 요청 본문을 파싱

//app.use('/chat', chatRouter); // '/chat'로 라우트 설정
app.use('/user', userRouter); // '/user'로 라우트 설정

io.on('connection', (socket) => {
    console.log(`유저가 입장하였습니다`);

    socket.on('chat message', (msg) =>{
        io.emit('chat message', msg);
    })

    socket.on('disconnect', () =>{
        console.log('유저가 나갔습니다');
    })
})


app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}/`);
});

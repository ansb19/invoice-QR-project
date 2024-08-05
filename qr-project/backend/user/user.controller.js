import { UserService } from './user_service.js';
import { User } from './user.js'; // 만약 User 클래스가 필요한 경우 import

const userService = new UserService();

// 유저 생성 요청 처리
export const createUser = async (req, res) => {
    const { id, password, name, email, emailCertNumber, grade } = req.body;
    const user = { id, password, name, email, emailCertNumber, grade }; // 객체 리터럴을 사용하여 유저 데이터 생성
    await userService.createUser(user);
    res.status(201).send('User created');
};

// 유저 정보 요청 처리
export const getUserById = async (req, res) => {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    res.status(200).json(user);
};

// 기타 컨트롤러 메소드들


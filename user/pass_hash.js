import bcrypt from 'bcrypt';

export class PassHash{
    constructor(){
        this.saltRounds = 10;
    }

    async hashPassword(password){ //비밀번호 해시화
        try{
            const hashedPassword = await bcrypt.hash(password, this.saltRounds);
            return hashedPassword;
        }
        catch(error){
            console.error(`Error hashing password: ${error}`);
        }
    }

    async verifyPassword(password, hashedPassword){
        try{
            const match = await bcrypt.compare(password, hashedPassword);
            return match; //true or false;
        }
        catch(error){
            console.error(`Error verifying password: ${error}`)
        }
    }
}
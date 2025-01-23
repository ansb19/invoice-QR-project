
export class USER { //유저 정의 클래스
    #id; //아이디
    #password; //비밀번호
    #name; //이름
    #email; //이메일
    #email_cert_number; //이메일 인증번호
    #phone; // 휴대폰 번호
     // 회원 타입
    #address; // 주소
    #zipcode; // 우편번호
    #grade; // 등급 상태 0 일반 1 택배원 2 관리자

    // constructor(id, password, name, email, email_cert_number, phone, address, zipcode, grade) {
    //     this.#id = id;
    //     this.#password = password;
    //     this.#name = name;
    //     this.#email = email;
    //     this.#email_cert_number = email_cert_number;
    //     this.#phone = phone;
    //     this.#address = address;
    //     this.#zipcode = zipcode;
    //     this.#grade = grade;
    // }
   
    get id() {
        return this.#id;
    }
    set id(id) {
        if(id.length > 0){
        this.#id = id;
        }
        else{
            console.error("invalid ID");
        }
    }
    get password() {
        return this.#password;
    }
    set password(password) {
        if(password.length >= 6){
            this.#password = password;
        }
        else{
            console.error("you have to write at least 6 characters");
        }
    }

    get name() {
        return this.#name;
    }
    set name(name) {
        this.#name = name;
    }

    get email() {
        return this.#email;
    }
    set email(email) {
        this.#email = email;
    }

    get email_cert_number() {
        return this.#email_cert_number;
    }
    set email_cert_number(email_cert_number) {
        this.#email_cert_number = email_cert_number;
    }


    get phone(){
        return this.#phone;
    }
    set phone(phone){
        this.#phone = phone;
    }

    get address(){
        return this.#address;
    }
    set address(address){
        return this.#address = address;
    }

    get zipcode(){
        return this.#zipcode;
    }
    set zipcode(zipcode){
        return this.#zipcode = zipcode;
    }

    get grade() {
        return this.#grade;
    }
    set grade(grade) {
        this.#grade = grade;
    }
}


// 코드 보안 강화:
// 모든 프로퍼티를 프라이빗 프로퍼티(#)로 선언하여 직접 접근 및 설정하지 못하도록 했습니다.
// password 프로퍼티의 setter 메서드에서 비밀번호 해시화 로직을 추가해야 합니다.
// email_cert_number 프로퍼티의 setter 메서드에서 인증번호 유효성 검사 로직을 추가해야 합니다.
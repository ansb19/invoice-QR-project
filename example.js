
class User {
    #id;
    #name;
  constructor(id, name) {
    this.#id = id;
    this.#name = name;
  }

  get id() {
    return this.#id;
  }

  set id(newId) {
    if (!newId.startsWith('user')) {
      throw new Error('ID는 user로 시작해야 합니다.');
    }
    this.#id = newId;
  }

  getName() {
    return this.#name;
  }

  setName(newName) {
    this.#name = newName;
  }
}

const user = new User('user123', '홍길동');

console.log(user.id); // user123
console.log(user.getName()); // 홍길동

user.name = "바보"; //이부분이 적용안됨

console.log(user.getName());

user.id = 'usernew123'; // 정상적으로 변경됨
console.log(user.id); // newUser123

user.id = '12345'; // 오류 발생: ID는 user로 시작해야 합니다.

user.setName('이순신');
console.log(user.getName()); // 이순신

class Cf {
    constructor (public username: string, public password: string) {
        this.username = username;
        this.password = password;
    }
    login() {
        console.log(`${this.username} is logging in`);
    }
}

const cf = new Cf('username', 'password');
cf.login();
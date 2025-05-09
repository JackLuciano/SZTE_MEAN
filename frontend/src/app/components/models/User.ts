export class User {
    userId: string;
    username: string;
    password: string;
    email: string;
    firstName: string;
    secondName: string;
    profilePicture: string;
    onlineStatus: boolean;
    balance: number = 0;
    role: string = 'user';

    constructor(
        userId: string,
        username: string,
        password: string,
        email: string,
        firstName: string,
        secondName: string,
        profilePicture: string,
        onlineStatus: boolean,
        balance: number = 0,
        role: string = 'user'
    ) {
        this.userId = userId;
        this.username = username;
        this.password = password;
        this.email = email;
        this.firstName = firstName;
        this.secondName = secondName;
        this.profilePicture = profilePicture;
        this.onlineStatus = onlineStatus;
        this.balance = balance;
        this.role = role;
    }

    static fromJson(json: any): User {
        return new User(
            json.userId,
            json.username,
            json.password,
            json.email,
            json.firstName,
            json.secondName,
            json.profilePicture,
            json.onlineStatus
        );
    }

    static getUser() : User | null {
        const user = localStorage.getItem('user');
        if (user) {
            return User.fromJson(JSON.parse(user));
        }
        return null;
    }
}
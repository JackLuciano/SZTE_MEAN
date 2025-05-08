export class User {
    userId: number;
    username: string;
    password: string;
    email: string;
    firstName: string;
    secondName: string;
    profilePicture: string;
    onlineStatus: boolean;

    constructor(
        userId: number,
        username: string,
        password: string,
        email: string,
        firstName: string,
        secondName: string,
        profilePicture: string,
        onlineStatus: boolean
    ) {
        this.userId = userId;
        this.username = username;
        this.password = password;
        this.email = email;
        this.firstName = firstName;
        this.secondName = secondName;
        this.profilePicture = profilePicture;
        this.onlineStatus = onlineStatus;
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
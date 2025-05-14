export class User {
    userId: string;
    
    firstName: string;
    secondName: string;
    profilePicture: string;

    username?: string;
    email?: string;
    balance?: number;

    onlineStatus?: boolean;
    role: string = 'user';

    constructor(
        userId: string,

        firstName: string,
        secondName: string,
        profilePicture: string,

        username?: string,
        email?: string,
        balance?: number,

        onlineStatus?: boolean,
        role: string = 'user'
    ) {
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.firstName = firstName;
        this.secondName = secondName;
        this.profilePicture = profilePicture;
        this.onlineStatus = onlineStatus;
        this.balance = balance;
        this.role = role;
    }

    static fromJson(json : any) : User {
        console.log(json._id)
        return new User(
            json._id,
            json.firstName,
            json.secondName,
            json.profilePicture,
            json.username,
            json.email,
            json.balance,
            json.onlineStatus,
            json.role
        );
    }
}
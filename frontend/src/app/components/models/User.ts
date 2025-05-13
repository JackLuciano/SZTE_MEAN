export class User {
    userId : string;
    username : string;
    email : string;
    firstName : string;
    secondName : string;
    profilePicture : string;
    onlineStatus : boolean;
    balance : number;
    role : string = 'user';

    constructor(
        userId : string,
        username : string,
        email : string,
        firstName : string,
        secondName : string,
        profilePicture : string,
        onlineStatus : boolean,
        balance : number,
        role : string = 'user'
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
        return new User(
            json._id,
            json.username,
            json.email,
            json.firstName,
            json.secondName,
            json.profilePicture,
            json.onlineStatus,
            json.balance,
            json.role
        );
    }
}
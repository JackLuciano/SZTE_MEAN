import { Db, DeleteResult, ObjectId } from 'mongodb';
import { getDatabase } from '../db';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS as string, 10) || 10;

export class User {
    _id: ObjectId;
    username: string;
    password: string;
    email: string;
    createdAt: Date;
    fullName: string;
    profilePicture: string;

    constructor(user: {
        _id: ObjectId;
        username: string;
        password: string;
        email: string;
        createdAt: Date;
        fullName: string;
        profilePicture: string;
    }) {
        this._id = user._id;
        this.username = user.username;
        this.password = user.password;
        this.email = user.email;
        this.createdAt = user.createdAt;
        this.fullName = user.fullName;
        this.profilePicture = user.profilePicture;
    }

    async save(): Promise<void> {
        const db : (Db | null) = getDatabase();
        await db?.collection('users').updateOne({ _id: this._id }, { $set: this });
    }

    async validatePassword(password: string): Promise<boolean> {
        return bcrypt.compare(password, this.password);
    }

    async delete(): Promise<boolean> {
        const db : (Db | null) = getDatabase();
        const result : (DeleteResult | undefined) = await db?.collection('users').deleteOne({ _id: new ObjectId(this._id) });
        return result?.deletedCount === 1;
    }

    private static mapToUser(user: any): User {
        return new User({
            _id: user._id,
            username: user.username,
            password: user.password,
            email: user.email,
            createdAt: user.createdAt,
            fullName: user.fullName,
            profilePicture: user.profilePicture,
        });
    }

    static async findByUsername(username: string): Promise<User | null> {
        const db : (Db | null) = getDatabase();
        const user = await db?.collection('users').findOne({ username });
        return user ? this.mapToUser(user) : null;
    }

    static async findById(id: string): Promise<User | null> {
        const db : (Db | null) = getDatabase();
        const user = await db?.collection('users').findOne({ _id: new ObjectId(id) });
        return user ? this.mapToUser(user) : null;
    }

    static async findByEmail(email: string): Promise<User | null> {
        const db : (Db | null) = getDatabase();
        const user = await db?.collection('users').findOne({ email });
        return user ? this.mapToUser(user) : null;
    }

    static async create(
        username: string,
        password: string,
        email: string,
        fullName: string,
        profilePicture: string
    ): Promise<{ status: boolean; message: string; }> {
        const db : (Db | null) = getDatabase();

        if (!email) return { status: false, message: 'Email is required.' };
        if (!email.includes('@')) return { status: false, message: 'Invalid email.' };
        if (password.length < 6) return { status: false, message: 'Password must be at least 6 characters long.' };

        if (await this.findByUsername(username)) return { status: false, message: 'Username already exists.' };
        if (await this.findByEmail(email)) return { status: false, message: 'Email already exists.' };

        const hashedPassword : string = await bcrypt.hash(password, SALT_ROUNDS);
        const user = new User({
            _id: new ObjectId(),
            username,
            password: hashedPassword,
            email,
            createdAt: new Date(),
            fullName,
            profilePicture: profilePicture,
        });

        await db?.collection('users').insertOne(user);
        return { status: true, message: 'User created successfully.' };
    }

    static async forgotPassword(email: string): Promise<{ status: boolean; message: string }> {
        const user : (User | null) = await this.findByEmail(email);
        if (!user) return { status: false, message: 'Email not found.' };

        const db : (Db | null) = getDatabase();
        const newPassword : string = await bcrypt.hash('asd123', SALT_ROUNDS);

        await db?.collection('users').updateOne(
            { _id: user._id },
            { $set: { password: newPassword } }
        );

        return { status: true, message: 'Password reset successfully.' };
    }
}

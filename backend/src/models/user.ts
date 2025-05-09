import { Db, DeleteResult, ObjectId } from 'mongodb';
import { getDatabase } from '../db';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { UploadedFile } from 'express-fileupload';
import path from 'path';
import fs from 'fs';

dotenv.config();

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS as string, 10) || 10;

export class User {
    _id: ObjectId;
    username: string;
    password: string;
    email: string;
    createdAt: Date;
    firstName: string;
    secondName: string;
    profilePicture: string;
    balance: number = 0;
    role: string = 'user';

    constructor(user: {
        _id: ObjectId;
        username: string;
        password: string;
        email: string;
        createdAt: Date;
        firstName: string;
        secondName: string;
        profilePicture: string;
        balance?: number;
        role?: string;
    }) {
        this._id = user._id;
        this.username = user.username;
        this.password = user.password;
        this.email = user.email;
        this.createdAt = user.createdAt;
        this.firstName = user.firstName;
        this.secondName = user.secondName;
        this.profilePicture = user.profilePicture;
        this.role = user.role || 'user';
        this.balance = user.balance || 0;
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
            firstName: user.firstName,
            secondName: user.secondName,
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
        firstName: string,
        secondName: string,
        picture: UploadedFile | null
    ): Promise<{ status: boolean; message: string; user?: User }> {
        const db : (Db | null) = getDatabase();

        if (!email) return { status: false, message: 'Email is required.' };
        if (!email.includes('@')) return { status: false, message: 'Invalid email.' };
        if (password.length < 6) return { status: false, message: 'Password must be at least 6 characters long.' };

        if (!firstName) return { status: false, message: 'First name is required.' };
        if (!secondName) return { status: false, message: 'Second name is required.' };

        if (await this.findByUsername(username)) return { status: false, message: 'Username already exists.' };
        if (await this.findByEmail(email)) return { status: false, message: 'Email already exists.' };

        const userId : ObjectId = new ObjectId();
        let fileName : string | null;
        if (picture) {
            const extension = path.extname(picture.name);
            fileName = `${userId}${extension}`;
            const uploadPath : string = path.join(__dirname, '../uploads/profile', fileName);

            if (!fs.existsSync(path.join(__dirname, '../uploads/profile'))) {
                fs.mkdirSync(path.join(__dirname, '../uploads/profile'));
            }

            picture.mv(uploadPath);
        }

        const hashedPassword : string = await bcrypt.hash(password, SALT_ROUNDS);
        const user = new User({
            _id: userId,
            username,
            password: hashedPassword,
            email,
            createdAt: new Date(),
            firstName,
            secondName,
            profilePicture: fileName! ? `/uploads/${fileName}` : "",
        });

        await db?.collection('users').insertOne(user);
        return { status: true, message: 'User created successfully.', user: user };
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

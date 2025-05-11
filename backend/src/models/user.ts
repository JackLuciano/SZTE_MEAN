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
    balance: number;
    role: string;

    constructor(user: Partial<User>) {
        this._id = user._id!;
        this.username = user.username!;
        this.password = user.password!;
        this.email = user.email!;
        this.createdAt = user.createdAt || new Date();
        this.firstName = user.firstName!;
        this.secondName = user.secondName!;
        this.profilePicture = user.profilePicture || '';
        this.balance = user.balance || 0;
        this.role = user.role || 'user';
    }

    async save(): Promise<void> {
        const db = getDatabase();
        await db?.collection('users').updateOne({ _id: this._id }, { $set: this });
    }

    async validatePassword(password: string): Promise<boolean> {
        return bcrypt.compare(password, this.password);
    }

    async delete(): Promise<boolean> {
        const db = getDatabase();
        const result = await db?.collection('users').deleteOne({ _id: this._id });
        return result?.deletedCount === 1;
    }

    private static mapToUser(user: any): User {
        return new User(user);
    }

    static async findByField(field: string, value: any): Promise<User | null> {
        const db = getDatabase();
        const user = await db?.collection('users').findOne({ [field]: value });
        return user ? this.mapToUser(user) : null;
    }

    static async findByUsername(username: string): Promise<User | null> {
        return this.findByField('username', username);
    }

    static async findById(id: string): Promise<User | null> {
        return this.findByField('_id', new ObjectId(id));
    }

    static async findByEmail(email: string): Promise<User | null> {
        return this.findByField('email', email);
    }

    static async create(
        username: string,
        password: string,
        email: string,
        firstName: string,
        secondName: string,
        picture: UploadedFile | null
    ): Promise<{ status: boolean; message: string; user?: User }> {
        const db = getDatabase();

        const validationError = this.validateUserInput(username, password, email, firstName, secondName);
        if (validationError) return { status: false, message: validationError };

        if (await this.findByUsername(username)) return { status: false, message: 'Username already exists.' };
        if (await this.findByEmail(email)) return { status: false, message: 'Email already exists.' };

        const userId = new ObjectId();
        const fileName = picture ? this.saveProfilePicture(picture, userId) : null;

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const user = new User({
            _id: userId,
            username,
            password: hashedPassword,
            email,
            firstName,
            secondName,
            profilePicture: fileName ? `/uploads/${fileName}` : '',
        });

        await db?.collection('users').insertOne(user);
        return { status: true, message: 'User created successfully.', user };
    }

    static async forgotPassword(email: string): Promise<{ status: boolean; message: string }> {
        const user = await this.findByEmail(email);
        if (!user) return { status: false, message: 'Email not found.' };

        const db = getDatabase();
        const newPassword = await bcrypt.hash('asd123', SALT_ROUNDS);

        await db?.collection('users').updateOne(
            { _id: user._id },
            { $set: { password: newPassword } }
        );

        return { status: true, message: 'Password reset successfully.' };
    }

    private static validateUserInput(
        username: string,
        password: string,
        email: string,
        firstName: string,
        secondName: string
    ): string | null {
        if (!username) return 'Username is required.';
        if (username.length < 5) return 'Username must be at least 5 characters long.';
        if (username.length > 20) return 'Username must be at most 20 characters long.';
        if (!firstName) return 'First name is required.';
        if (!secondName) return 'Second name is required.';
        if (!/^[a-zA-Z0-9]+$/.test(username)) return 'Username can only contain letters and numbers.';
        if (!/^[a-zA-Z]+$/.test(firstName)) return 'First name can only contain letters.';
        if (!/^[a-zA-Z]+$/.test(secondName)) return 'Second name can only contain letters.';
        if (firstName.length < 5) return 'First name must be at least 5 characters long.';
        if (firstName.length > 30) return 'First name must be at most 30 characters long.';
        if (secondName.length < 5) return 'Second name must be at least 5 characters long.';
        if (secondName.length > 30) return 'Second name must be at most 30 characters long.';
        if (!email) return 'Email is required.';
        if (!email.includes('@')) return 'Invalid email.';
        if (!email.includes('.')) return 'Invalid email.';
        if (email.length < 5) return 'Email must be at least 5 characters long.';
        if (email.length > 50) return 'Email must be at most 50 characters long.';
        if (!password) return 'Password is required.';
        if (password.length < 6) return 'Password must be at least 6 characters long.';
        
        return null;
    }

    private static saveProfilePicture(picture: UploadedFile, userId: ObjectId): string {
        const extension = path.extname(picture.name);
        const fileName = `${userId}${extension}`;
        const uploadPath = path.join(__dirname, '../uploads/profile', fileName);

        if (!fs.existsSync(path.join(__dirname, '../uploads/profile'))) {
            fs.mkdirSync(path.join(__dirname, '../uploads/profile'));
        }

        picture.mv(uploadPath);
        return fileName;
    }
}

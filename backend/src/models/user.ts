import { ObjectId, WithId } from 'mongodb';
import { getDatabase } from '../db';
import dotenv from 'dotenv';

dotenv.config();

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS as string, 10) || 10;

import bcrypt from 'bcrypt';

export class User {
    _id: ObjectId;
    username: string;
    password: string;
    email: string;
    createdAt: Date;
    fullName: string;
    profilePicture: string;

    constructor(user: { _id: ObjectId; username: string; password: string; email: string; createdAt: Date, fullName: string; profilePicture: string; }) {
        this._id = user._id;
        this.username = user.username;
        this.password = user.password;
        this.email = user.email;
        this.createdAt = user.createdAt;
        this.fullName = user.fullName;
        this.profilePicture = user.profilePicture;
    }

    async validatePassword(password: string): Promise<boolean> {
        return await bcrypt.compare(password, this.password);
    }

    static async findByUsername(username: string): Promise<User | null> {
        const db = getDatabase();
        const user = await db?.collection('users').findOne({ username: username });
        if (!user) return null;

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

    static async findById(id: string): Promise<User | null> {
        const db = getDatabase();
        const user = await db?.collection('users').findOne({ _id: new ObjectId(id) });
        if (!user) return null;

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

    static async findByEmail(email: string): Promise<User | null> {
        const db = getDatabase();
        const user = await db?.collection('users').findOne({ email: email });
        if (!user) return null;

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

    static async create(username: string, password: string, email: string, fullName: string, profilePicture: string): Promise<{ status: boolean; message: string; user?: User }> {
        const db = getDatabase();
        const user = new User({
            _id: new ObjectId(),
            username,
            password: await bcrypt.hash(password, SALT_ROUNDS),
            email,
            createdAt: new Date(),
            fullName,
            profilePicture: '',
        });

        const existingUser = await this.findByUsername(username);
        if (existingUser) {
            return { status: false, message: 'Username already exists.' };
        }

        if (!email) {
            return { status: false, message: 'Email is required.' };
        }

        const existingEmail = await this.findByEmail(email);
        if (existingEmail) {
            return { status: false, message: 'Email already exists.' };
        }

        if (!email.includes('@')) {
            return { status: false, message: 'Invalid email.' };
        }

        if (password.length < 6) {
            return { status: false, message: 'Password must be at least 6 characters long.' };
        }

        await db?.collection('users').insertOne(user);
        return { status: true, message: 'User created successfully.', user };
    }

    static async delete(id: string): Promise<boolean | null> {
        const db = getDatabase();
        const user = await this.findById(id);
        if (!user) return false;

        const result = await db?.collection('users').deleteOne({ _id: new ObjectId(id) });
        return result?.deletedCount === 1 || null;
    }

    static async forgotPassword(email: string): Promise<{ status: boolean; message: string }> {
        const user = await this.findByEmail(email);
        if (!user) {
            return { status: false, message: 'Email not found.' };
        }

        const db = getDatabase();

        const password = await bcrypt.hash('asd123', SALT_ROUNDS);
        user.password = password;
        
        await db?.collection('users').updateOne({ _id: user._id }, { $set: { password: password } });

        return { status: true, message: 'Password reset successfully.' };
    }
}
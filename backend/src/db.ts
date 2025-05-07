import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const client = new MongoClient(process.env.DB_URL as string);
let db: Db | null = null;

export async function connectToDatabase() {
    await client.connect();
    db = client.db(process.env.DB_NAME) as Db;
    console.log('Successfully connected to database!');
}

export function getDatabase(): Db | null {
    if (!db) {
        throw new Error('Database not connected. Call connectToDatabase first.');
    }
    return db;
}
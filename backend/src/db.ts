import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const client = new MongoClient(process.env.DB_URL as string);
let db: Db | null = null;

async function fixDatabase() {
    if (!db) {
        throw new Error('Database not connected. Call connectToDatabase first.');
    }

    const collectionsToFix = [
        { name: 'logs', fields: ['userId'] },
        { name: 'items', fields: ['ownerId', 'boughtBy'] },
    ];

    for (const { name, fields } of collectionsToFix) {
        const collection = db.collection(name);
        for (const field of fields) {
            await collection.updateMany(
                { [field]: { $type: 'string' } },
                [{ $set: { [field]: { $convert: { input: `$${field}`, to: 'objectId', onError: `$${field}`, onNull: `$${field}` } } } }]
            );
        }
    }

    console.log('Database fields fixed successfully!');
}

export async function connectToDatabase() {
    await client.connect();
    db = client.db(process.env.DB_NAME) as Db;
    console.log('Successfully connected to database!');

    await fixDatabase();
}

export function getDatabase(): Db | null {
    if (!db) {
        throw new Error('Database not connected. Call connectToDatabase first.');
    }
    return db;
}
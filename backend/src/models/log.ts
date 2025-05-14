import { ObjectId } from "mongodb";
import { LogType } from "../data/logTypes";
import { getDatabase } from "../db";

export class Log {
    _id: ObjectId;
    type: LogType;
    userId: ObjectId;
    data: string;
    createdAt: Date;

    constructor({ _id, type, userId, data, createdAt }: { _id: ObjectId; type: LogType; userId: ObjectId; data: string; createdAt: Date }) {
        this._id = _id;
        this.type = type;
        this.userId = userId;
        this.data = data;
        this.createdAt = createdAt;
    }

    private static mapToLog(log: any): Log {
        return new Log({
            _id: log._id,
            type: log.type,
            userId: log.userId,
            data: log.data,
            createdAt: log.createdAt,
        });
    }

    static async getById(id: ObjectId): Promise<Log | null> {
        const log = await this.findById(id);
        return log ? this.mapToLog(log) : null;
    }

    static async findById(id: ObjectId): Promise<any | null> {
        const db = getDatabase();
        return db?.collection('logs').findOne({ _id: id });
    }

    static async findByUserId(userId: ObjectId): Promise<Log[]> {
        const db = getDatabase();
        const logs = await db?.collection('logs').find({ userId }).toArray();
        return logs?.map(this.mapToLog) || [];
    }

    static async getAll(userId: ObjectId): Promise<Log[]> {
        return this.findByUserId(userId);
    }

    static async create(type: LogType, userId: ObjectId, data: any): Promise<{ status: boolean; message: string }> {
        const db = getDatabase();
        const log = new Log({
            _id: new ObjectId(),
            type,
            userId,
            data: JSON.stringify(data),
            createdAt: new Date(),
        });

        await db?.collection('logs').insertOne(log);
        return { status: true, message: "Log created successfully." };
    }
}

export async function addLog(logType: LogType, userId: ObjectId, data: any): Promise<{ status: boolean; message: string }> {
    return Log.create(logType, userId, data);
}

export default Log;

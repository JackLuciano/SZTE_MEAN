import { Db, ObjectId } from "mongodb";
import { LogType } from "../data/logTypes";
import { getDatabase } from "../db";

export class Log {
    _id: ObjectId;
    type: LogType;
    userId: ObjectId;
    data: string;
    createdAt: Date;

    constructor(log: {
        _id: ObjectId;
        type: LogType;
        userId: ObjectId;
        data: string;
        createdAt: Date;
    }) {
        this._id = log._id;
        this.type = log.type;
        this.userId = log.userId;
        this.data = log.data;
        this.createdAt = log.createdAt;
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
        const log : Log | null = await Log.findById(id);
        return log ? this.mapToLog(log) : null;
    }

    static async findById(id: ObjectId): Promise<Log | null> {
        const db : (Db | null) = getDatabase();
        const log = await db?.collection('logs').findOne({ _id: id });
        return log?.map(this.mapToLog) || [];
    }

    static async findByUserId(userId: ObjectId): Promise<Log[]> {
        const db : (Db | null) = getDatabase();
        const logs = await db?.collection('logs').find({ userId }).toArray();
        return logs?.map(this.mapToLog) || [];
    }

    static async getAll(userId: ObjectId): Promise<Log[]> {
        const logs : Log[] = await Log.findByUserId(userId);
        return logs?.map(this.mapToLog) || [];
    }

    static async create(
        type: LogType,
        userId: ObjectId,
        data: string
    ) : Promise<{ status: boolean; message: string }> {
        const db = getDatabase();
        const log = new Log({
            _id: new ObjectId(),
            type,
            userId,
            data,
            createdAt: new Date(),
        });

        await db?.collection('logs').insertOne(log);
        return { status: true, message: "Log created successfully." };
    }
}

export async function addLog(logType: LogType, userId: ObjectId, data: string): Promise<{ status: boolean; message: string; }> {
    return await Log.create(logType, userId, data);
}

export default Log;
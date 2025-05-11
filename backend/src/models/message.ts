import { Db, DeleteResult, ObjectId } from 'mongodb';
import { MessageType } from '../data/messageTypes';
import { getDatabase } from '../db';

export class Message {
    _id: ObjectId;
    senderId: ObjectId;
    receiverId: ObjectId;
    message: string;
    messageType: MessageType;
    createdAt: Date;
    readAt: Date | null;

    constructor({
        _id,
        senderId,
        receiverId,
        message,
        messageType,
        createdAt,
        readAt,
    }: {
        _id: ObjectId;
        senderId: ObjectId;
        receiverId: ObjectId;
        message: string;
        messageType: MessageType;
        createdAt: Date;
        readAt: Date | null;
    }) {
        this._id = _id;
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.message = message;
        this.messageType = messageType;
        this.createdAt = createdAt;
        this.readAt = readAt;
    }

    async save(): Promise<void> {
        const db = getDatabase();
        if (!db) throw new Error('Database connection not available');
        await db.collection('messages').updateOne({ _id: this._id }, { $set: this });
    }

    async delete(): Promise<boolean> {
        const db = getDatabase();
        if (!db) throw new Error('Database connection not available');
        const result = await db.collection('messages').deleteOne({ _id: this._id });
        return result.deletedCount === 1;
    }

    private static mapToMessage(data: any): Message {
        return new Message({
            _id: data._id,
            senderId: data.senderId,
            receiverId: data.receiverId,
            message: data.message,
            messageType: data.messageType,
            createdAt: data.createdAt,
            readAt: data.readAt,
        });
    }

    private static async getMessagesByField(field: 'senderId' | 'receiverId', id: ObjectId): Promise<Message[]> {
        const db = getDatabase();
        if (!db) throw new Error('Database connection not available');
        const messages = await db.collection('messages').find({ [field]: id }).toArray();
        return messages.map(this.mapToMessage);
    }

    static async getBySenderId(senderId: ObjectId): Promise<Message[]> {
        return this.getMessagesByField('senderId', senderId);
    }

    static async getByReceiverId(receiverId: ObjectId): Promise<Message[]> {
        return this.getMessagesByField('receiverId', receiverId);
    }

    static async findById(messageId: ObjectId): Promise<Message | null> {
        const db = getDatabase();
        if (!db) throw new Error('Database connection not available');
        const message = await db.collection('messages').findOne({ _id: messageId });
        return message ? this.mapToMessage(message) : null;
    }

    static async getCurrentMessages(userId: ObjectId, targetId: ObjectId): Promise<Message[]> {
        const db = getDatabase();
        if (!db) throw new Error('Database connection not available');
        const messages = await db.collection('messages').find({
            $or: [
                { senderId: userId, receiverId: targetId },
                { senderId: targetId, receiverId: userId },
            ],
        }).toArray();
        return messages.map(this.mapToMessage);
    }

    static async getAllMessages(userId: ObjectId): Promise<Message[]> {
        const [sentMessages, receivedMessages] = await Promise.all([
            this.getBySenderId(userId),
            this.getByReceiverId(userId),
        ]);
        return [...sentMessages, ...receivedMessages];
    }

    static async createMessage(
        userId: ObjectId,
        targetId: ObjectId,
        message: string,
        messageType: MessageType
    ): Promise<Message> {
        const db = getDatabase();
        if (!db) throw new Error('Database connection not available');
        const newMessage = new Message({
            _id: new ObjectId(),
            senderId: userId,
            receiverId: targetId,
            message,
            messageType,
            createdAt: new Date(),
            readAt: null,
        });
        await db.collection('messages').insertOne(newMessage);
        return newMessage;
    }
}
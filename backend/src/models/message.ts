import { ObjectId } from 'mongodb';
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

    constructor(message: {
        _id: ObjectId;
        senderId: ObjectId;
        receiverId: ObjectId;
        message: string;
        messageType: MessageType;
        createdAt: Date;
        readAt: Date | null;
    }) {
        this._id = message._id;
        this.senderId = message.senderId;
        this.receiverId = message.receiverId;
        this.message = message.message;
        this.messageType = message.messageType;
        this.createdAt = message.createdAt;
        this.readAt = message.readAt;
    }

    async save(): Promise<void> {
        const db = getDatabase();
        await db?.collection('messages').updateOne({ _id: this._id }, { $set: this });
    } 

    async delete(): Promise<boolean> {
        const db = getDatabase();
        const result = await db?.collection('messages').deleteOne({ _id: this._id });
        return result?.deletedCount === 1;
    }

    private static mapToMessage(message: any): Message {
        return new Message({
            _id: message._id,
            senderId: message.senderId,
            receiverId: message.receiverId,
            message: message.message,
            messageType: message.messageType,
            createdAt: message.createdAt,
            readAt: message.readAt,
        });
    }

    private static async getMessagesByField(field: 'senderId' | 'receiverId', id: ObjectId): Promise<Message[]> {
        const db = getDatabase();
        const messages = await db?.collection('messages').find({ [field]: id }).toArray();
        return messages?.map(this.mapToMessage) || [];
    }

    static async getBySenderId(senderId: ObjectId): Promise<Message[]> {
        return this.getMessagesByField('senderId', senderId);
    }

    static async getByReceiverId(receiverId: ObjectId): Promise<Message[]> {
        return this.getMessagesByField('receiverId', receiverId);
    }

    static async findById(messageId: ObjectId): Promise<Message | null> {
        const db = getDatabase();
        const message = await db?.collection('messages').findOne({ _id: messageId });
        return message ? this.mapToMessage(message) : null;
    }

    static async getCurrentMessages(userId: ObjectId, targetId: ObjectId): Promise<Message[]> {
        const db = getDatabase();
        const messages = await db?.collection('messages').find({
            $or: [
                { senderId: userId, receiverId: targetId },
                { senderId: targetId, receiverId: userId },
            ],
        }).toArray();

        return messages?.map(this.mapToMessage) || [];
    }

    static async getAllMessages(userId: ObjectId): Promise<Message[]> {
        const [sentMessages, receivedMessages] = await Promise.all([
            this.getBySenderId(userId),
            this.getByReceiverId(userId),
        ]);

        return [...sentMessages, ...receivedMessages];
    }

    static async createMessage(userId: ObjectId, targetId: ObjectId, message: string, messageType: MessageType) : Promise<Message> {
        const db = getDatabase();
        const newMessage = new Message({
            _id: new ObjectId(),
            senderId: userId,
            receiverId: targetId,
            message,
            messageType,
            createdAt: new Date(),
            readAt: null,
        });

        await db?.collection('messages').insertOne(newMessage);
        return newMessage;
    }
}
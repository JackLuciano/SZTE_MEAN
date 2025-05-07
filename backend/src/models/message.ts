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

    static async getAllMessages(userId: ObjectId): Promise<Message[]> {
        const [sentMessages, receivedMessages] = await Promise.all([
            this.getBySenderId(userId),
            this.getByReceiverId(userId),
        ]);

        return [...sentMessages, ...receivedMessages];
    }
}
import express from 'express';
import { Message } from '../../models/message';
import { ObjectId } from 'mongodb';
import { MessageType } from '../../data/messageTypes';

const router = express.Router();

router.get('/', async (req: express.Request, res: express.Response) => {
    const userId = (req as any).user._id;

    const messages: Message[] = await Message.getAllMessages(userId);

    res.json({ messages });
});

router.get('/open', async (req: express.Request, res: express.Response) => {
    const userId = (req as any).user._id;
    const targetId = new ObjectId(req.params.targetId);

    const messages: Message[] = await Message.getCurrentMessages(userId, targetId);

    res.json({ messages });
});

router.post('/', async (req: express.Request, res: express.Response) => {
    const userId = (req as any).user._id;
    const { targetId, message, messageType } : { targetId: ObjectId; message: string; messageType: MessageType; } = req.body; 

    const newMessage: Message = await Message.createMessage(userId, targetId, message, messageType);

    res.status(201).json({ message: newMessage });
});

router.post('/read/', async (req: express.Request, res: express.Response) => {
    const userId = (req as any).user._id;
    const messageId = new ObjectId(req.params.messageId);

    const message: Message | null = await Message.findById(messageId);
    if (!message) {
        res.status(404).json({ message: 'Message not found.' });

        return;
    }

    if (message.receiverId.toString() !== userId.toString()) {
        res.status(403).json({ message: 'You are not authorized to read this message.' });

        return;
    }

    message.readAt = new Date();
    await message.save();
    res.json({ message: 'Message read successfully.' });
});

router.post('/delete/', async (req: express.Request, res: express.Response) => {
    const userId = (req as any).user._id;
    const messageId = new ObjectId(req.params.messageId);

    const message: Message | null = await Message.findById(messageId);
    if (!message) {
        res.status(404).json({ message: 'Message not found.' });

        return;
    }

    if (message.senderId.toString() !== userId.toString()) {
        res.status(403).json({ message: 'You are not authorized to delete this message.' });

        return;
    }

    const response = await message.delete(); 
    res.json({ message: response ? 'Message deleted successfully.' : 'Failed to delete message.' });
});
 
export default router;
import express from 'express';
import { Message } from '../../models/message';

const router = express.Router();

router.get('/', async (req: express.Request, res: express.Response) => {
    const userId = (req as any).user._id;

    const messages: Message[] = await Message.getAllMessages(userId);

    res.json({ messages });
});

export default router;
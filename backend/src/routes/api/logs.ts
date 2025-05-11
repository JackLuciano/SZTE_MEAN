import express from 'express';
import Log from '../../models/log';
import { ObjectId } from 'mongodb';

const router = express.Router();

router.get('/', async (req: express.Request, res: express.Response) => {
    const userId: ObjectId = (req as any).user.userId;
    const logs = await Log.getAll(userId);
    res.json(logs);
});

export default router;

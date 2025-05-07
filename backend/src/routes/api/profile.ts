import express from 'express';
import { ObjectId } from 'mongodb';

const router = express.Router();

router.post('/update', (req: express.Request, res: express.Response) => {
    // UPDATE PROFILE AND SEND IT BACK LATER ON 
    const userId : ObjectId = (req as any).user.userId;
});

export default router;
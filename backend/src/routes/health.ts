import express from 'express';

const router = express.Router();

router.get('/', (req: express.Request, res: express.Response) => {
    res.status(200).json({ message: 'OK' });
});

export default router;
import express from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const SECRET = process.env.JWT_SECRET as string;

router.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader: string | undefined = req.headers['authorization'];
    const token: string | undefined = authHeader?.split(' ')[1];

    if (!token) {
        res.status(401).json({ message: 'Unauthorized' });

        return;
    }

    jwt.verify(token, SECRET, (err, user) => {
        if (err) {
            res.status(403).json({ message: 'Forbidden' });

            return
        }
        
        if (!user) {
            res.status(401).json({ message: 'Unauthorized' });

            return;
        }

        (req as any).user = user;
        next();
    });

    // For testing purposes, remove in production
    // (req as any).user = { userId: 'testUserId' }; // For testing purposes, remove in production
    // next();
});

router.get('/test', (req: express.Request, res: express.Response) => {
    const user = (req as any).user;
    res.json({
      message: 'Hello from protected route!',
      user: user,
    });
});

export default router;

import express from 'express';
import jwt from 'jsonwebtoken';
import { SECRET } from '../config';

const router = express.Router();
export const middleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader: string | undefined = req.headers['authorization'];
    const token: string | undefined = authHeader?.split(' ')[1];

    if (!token) {
        res.status(401).json({ message: 'Unauthorized' });

        return;
    }

    jwt.verify(token, SECRET, (err, user) => {
        if (err) {
            res.status(403).json({ message: 'Forbidden' });

            return;
        }

        if (!user || typeof user === 'string' || !(user as jwt.JwtPayload).userId) {
            res.status(401).json({ message: 'Unauthorized' });

            return;
        }

        (req as any).user = user as jwt.JwtPayload;
        next();
    });

    // For testing purposes, remove in production
    // (req as any).user = { userId: 'testUserId' }; // For testing purposes, remove in production
    // next();
}

router.use(middleware);

router.get('/test', (req: express.Request, res: express.Response) => {
    const user = (req as any).user;
    res.json({
      message: 'Hello from protected route!',
      user: user,
    });
});

export default router;
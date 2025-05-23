
import express from 'express';
import jwt from 'jsonwebtoken';
import { SECRET } from '../config';

const router = express.Router();

const processJWT = (token: string, next: express.NextFunction, req: express.Request, res: express.Response) => {
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
}

export const middleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader: string | undefined = req.headers['authorization'];
    const token: string | undefined = authHeader?.split(' ')[1];

    if (!token) {
        res.status(401).json({ message: 'Unauthorized' });

        return;
    }

    processJWT(token, next, req, res);
}

export const optionalMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader: string | undefined = req.headers['authorization'];
    const token: string | undefined = authHeader?.split(' ')[1];

    if (!token) {
        next();

        return;
    }

    processJWT(token, next, req, res);
}

export const alreadyLoggedInMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader: string | undefined = req.headers['authorization'];
    const token: string | undefined = authHeader?.split(' ')[1];

    if (token) {
        res.status(400).json({ message: 'Already logged in' });

        return;
    }

    next();
}

router.use(middleware);

export default router;
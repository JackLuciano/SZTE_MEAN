import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user';
import { SECRET } from '../config';
import { middleware } from './protected';
import { UploadedFile } from 'express-fileupload';
import { addLog } from '../models/log';
import { LogType } from '../data/logTypes';

const router = express.Router();

const sendErrorResponse = (res: express.Response, status: number, message: string) => {
    res.status(status).json({ message });
};

router.post('/login', async (req: express.Request, res: express.Response) => {
    const { username, password } = req.body;

    const user = await User.findByUsername(username) || await User.findByEmail(username);
    if (!user || !await user.validatePassword(password)) {
        return sendErrorResponse(res, 401, 'Invalid username or password.');
    }

    const token = jwt.sign({ userId: user._id }, SECRET, { expiresIn: '1h' });
    res.status(200).json({
        token,
        user: {
            _id: user._id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            secondName: user.secondName,
            profilePicture: user.profilePicture,
            createdAt: user.createdAt,
            balance: user.balance,
            onlineStatus: true,
            role: user.role,
        },
    });

    addLog(LogType.LOGIN, user._id, [
        { username: user.username },
        { ip: req.ip },
        { userAgent: req.headers['user-agent'] },
    ]);
});

router.post('/register', async (req: express.Request, res: express.Response) => {
    const authHeader = req.headers['authorization'];
    if (authHeader?.split(' ')[1]) {
        return sendErrorResponse(res, 401, 'Already logged in.');
    }

    const picture = req.files?.profilePicture as UploadedFile;
    const { username, password, email, firstName, secondName } = req.body;

    const { status, message, user } = await User.create(username, password, email, firstName, secondName, picture);
    if (!status) {
        return sendErrorResponse(res, 400, message);
    }

    res.status(201).json({ message });

    addLog(LogType.REGISTRATION, user!._id, [
        { username },
        { ip: req.ip },
        { userAgent: req.headers['user-agent'] },
    ]);
});

router.post('/logout', middleware, (req: express.Request, res: express.Response) => {
    res.json({ message: 'Successfully logged out.' });
});

router.get('/verify', middleware, async (req: express.Request, res: express.Response) => {
    const userId = (req as any).user?.userId;
    const user : User | null = await User.findById(userId);
    
    res.json({ message: 'Token is valid.', user: user });
});

router.post('/forgot-password', async (req: express.Request, res: express.Response) => {
    const authHeader = req.headers['authorization'];
    if (authHeader?.split(' ')[1]) {
        return sendErrorResponse(res, 401, 'Already logged in.');
    }

    const { email } = req.body;
    if (!email) {
        return sendErrorResponse(res, 400, 'Email is required.');
    }

    const user = await User.findByEmail(email);
    if (!user) {
        return sendErrorResponse(res, 404, 'User not found.');
    }

    await User.forgotPassword(email);
    res.json({ message: 'Password reset email sent. Check your inbox. (new password is asd123)' });

    addLog(LogType.FORGOT_PASSWORD, user._id, [
        { username: user.username },
        { ip: req.ip },
        { userAgent: req.headers['user-agent'] },
    ]);
});

router.post('/delete-account', middleware, async (req: express.Request, res: express.Response) => {
    const user = (req as any).user;
    const userId = user?.userId;

    if (!userId) {
        return sendErrorResponse(res, 401, 'Unauthorized');
    }

    await user.delete();
    res.json({ message: 'Account deleted successfully.' });

    addLog(LogType.DELETE_ACCOUNT, user._id, [
        { username: user.username },
        { ip: req.ip },
        { userAgent: req.headers['user-agent'] },
    ]);
});

export default router;

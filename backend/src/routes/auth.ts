import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user';
import { SECRET } from '../config';
import { alreadyLoggedInMiddleware, middleware } from './protected';
import { UploadedFile } from 'express-fileupload';
import { addLog } from '../models/log';
import { LogType } from '../data/logTypes';
import { ObjectId } from 'mongodb';
import { handleError } from '../models/error';

const router = express.Router();

const convertUserToResponse = (user: User) => ({
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
});

router.post('/login', alreadyLoggedInMiddleware, async (req: express.Request, res: express.Response) => {
    try {
        const { username, password } = req.body;

        const user = await User.findByUsername(username) || await User.findByEmail(username);
        if (!user || !await user.validatePassword(password)) {
            return handleError(res, 401, 'Invalid username or password.');
        }

        const token = jwt.sign({ userId: new ObjectId(user._id) }, SECRET, { expiresIn: '1h' });
        res.status(200).json({
            token,
            user: convertUserToResponse(user),
        });

        addLog(LogType.LOGIN, user._id, [
            { username: user.username },
            { ip: req.ip },
            { userAgent: req.headers['user-agent'] },
        ]);
    } catch (error: any) {
        console.error('Error during login:', error);
        handleError(res, 500, 'Internal server error.');
    }
});

router.post('/register', alreadyLoggedInMiddleware, async (req: express.Request, res: express.Response) => {
    try {
        const picture = req.files?.profilePicture as UploadedFile;
        const { username, password, email, firstName, secondName } = req.body;

        const { status, message, user } = await User.create(username, password, email, firstName, secondName, picture);
        if (!status) {
            return handleError(res, 400, message);
        }

        res.status(201).json({ message });

        addLog(LogType.REGISTRATION, user!._id, [
            { username },
            { ip: req.ip },
            { userAgent: req.headers['user-agent'] },
        ]);
    } catch (error: any) {
        console.error('Error during registration:', error);
        handleError(res, 500, 'Internal server error.');
    }
});

router.post('/logout', middleware, (req: express.Request, res: express.Response) => {
    res.json({ message: 'Successfully logged out.' });
});

router.get('/verify', middleware, async (req: express.Request, res: express.Response) => {
    try {
        const userId = (req as any).user?.userId;
        if (!userId) {
            return handleError(res, 401, 'Unauthorized');
        }

        const user = await User.findById(userId);
        if (!user) {
            return handleError(res, 404, 'User not found.');
        }

        res.status(200).json({ message: 'Token is valid.', user: convertUserToResponse(user) });
    } catch (error: any) {
        console.error('Error during token verification:', error);
        handleError(res, 500, 'Internal server error.');
    }
});

router.post('/forgot-password', alreadyLoggedInMiddleware, async (req: express.Request, res: express.Response) => {
    try {
        const { email } = req.body;
        if (!email) {
            return handleError(res, 400, 'Email is required.');
        }

        const user = await User.findByEmail(email);
        if (!user) {
            return handleError(res, 404, 'User not found.');
        }

        await User.forgotPassword(email);
        res.json({ message: 'Password reset email sent. Check your inbox. (new password is asd123)' });

        addLog(LogType.FORGOT_PASSWORD, user._id, [
            { username: user.username },
            { ip: req.ip },
            { userAgent: req.headers['user-agent'] },
        ]);
    } catch (error: any) {
        console.error('Error during password reset:', error);
        handleError(res, 500, 'Internal server error.');
    }
});

router.post('/delete-account', middleware, async (req: express.Request, res: express.Response) => {
    try {
        const user = (req as any).user;
        const userId = user?.userId;

        if (!userId) {
            return handleError(res, 401, 'Unauthorized');
        }

        await user.delete();
        res.json({ message: 'Account deleted successfully.' });

        addLog(LogType.DELETE_ACCOUNT, user._id, [
            { username: user.username },
            { ip: req.ip },
            { userAgent: req.headers['user-agent'] },
        ]);
    } catch (error: any) {
        console.error('Error during account deletion:', error);
        handleError(res, 500, 'Internal server error.');
    }
});

export default router;

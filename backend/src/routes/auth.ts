import express from 'express';

import jwt from 'jsonwebtoken';
import { User } from '../models/user';
import { SECRET } from '../config';
import { middleware } from './protected';
import { UploadedFile } from 'express-fileupload';

const router = express.Router();

router.post('/login', async (req: express.Request, res: express.Response) => {
    const { username, password } = req.body;

    const user: User | null = await User.findByUsername(username) || await User.findByEmail(username);

    if (!user || !await user.validatePassword(password)) {
        res.status(401).json({ message: 'Invalid username or password.' });

        return;
    }

    const token = jwt.sign({ userId: user._id }, SECRET, { expiresIn: '1h' });
    res.status(200).json({ token, user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        secondName: user.secondName,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt,
    } });
});

router.post('/register', async (req: express.Request, res: express.Response) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];
    if (token) {
        res.status(401).json({ message: 'Already logged in.' });

        return;
    }


    const picture = req.files?.profilePicture as UploadedFile;

    const { username, password, email, firstName, secondName } : { username: string; password: string; email: string; firstName: string; secondName: string; } = req.body;
    const { status, message } = await User.create(username, password, email, firstName, secondName, picture);
    if (!status) {
        res.status(400).json({ message });

        return;
    }

    res.status(201).json({ message });
});

router.post('/logout', middleware, (req: express.Request, res: express.Response) => {
    // TODO CHANGE ONLINE STATUS TO FALSE LATER ON

    res.json({ message: 'Successfully logged out.' });
});

router.post('/forgot-password', async (req: express.Request, res: express.Response) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (token) {
        res.status(401).json({ message: 'Already logged in.' });

        return;
    }

    const { email } : { email: string | undefined } = req.body;
    if (!email) {
        res.status(400).json({ message: 'Email is required.' });

        return;
    }

    const user: User | null = await User.findByEmail(email);
    if (!user) {
        res.status(404).json({ message: 'User not found.' });

        return;
    }

    await User.forgotPassword(email);
    res.json({ message: 'Password reset email sent. Check your inbox. (new password is asd123)' });
});

router.post('/delete-account', middleware, async (req: express.Request, res: express.Response) => {
    const user = (req as any).user;
    const userId = user.userId;

    if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });

        return;
    }

    await user.delete();
    res.json({ message: 'Account deleted successfully.' });
});

export default router;
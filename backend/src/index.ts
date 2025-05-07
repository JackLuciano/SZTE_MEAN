import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectToDatabase } from './db';
import { User } from './models/user';
import protectedRoutes from './routes/protected';
import jwt from 'jsonwebtoken';
import authRoutes from './routes/auth';

dotenv.config();

export const app = express();

const PORT: number = parseInt(process.env.PORT as string, 10) || 3000;
export const SECRET: string = process.env.JWT_SECRET as string;

app.use(cors());
app.use(bodyParser.json());

app.use('/auth', authRoutes);
app.use('/api', protectedRoutes);

connectToDatabase()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Failed to connect to database:', err);
    });

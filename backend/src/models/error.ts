import express from 'express';

export const handleError = (res: express.Response, statusCode: number, message: string) => {
    res.status(statusCode).json({ message });
};
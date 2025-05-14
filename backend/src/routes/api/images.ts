import express from 'express';
import fs from 'fs';
import { handleError } from '../../models/error';

const router = express.Router();

router.get('/profile/:imageId', async (req: express.Request, res: express.Response) => {
    const imageId = req.params.imageId;

    if (!imageId) {
        handleError(res, 400, 'Image ID is required');

        return;
    }

    try {
        const image = await fs.promises.readFile(`./src/uploads/${imageId}`);
        res.setHeader('Content-Type', 'image/jpeg');
        res.send(image);
    } catch (error: any) {
        console.error('Error fetching image:', error);
        handleError(res, 500, 'Failed to fetch image');
    }
});

export default router;
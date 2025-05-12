import express from 'express';
import { Item } from '../../models/item';
import { middleware } from '../protected';
import { ObjectId } from 'mongodb';
import { UploadedFile } from 'express-fileupload';
import { addLog } from '../../models/log';
import { LogType } from '../../data/logTypes';

const router = express.Router();

const handleError = (res: express.Response, statusCode: number, message: string) => {
    res.status(statusCode).json({ message });
};

router.get('/', async (req: express.Request, res: express.Response) => {
    try {
        const items: Item[] = await Item.getAllItems();
        res.json(items);
    } catch (error) {
        handleError(res, 500, 'Failed to fetch items');
    }
});

router.get('/:id', async (req: express.Request, res: express.Response) => {
    try {
        const item: Item | null = await Item.findById(req.params.id);
        if (!item) {
            return handleError(res, 404, 'Item not found');
        }
        res.json(item);
    } catch (error) {
        handleError(res, 500, 'Failed to fetch item');
    }
});

router.post('/create', middleware, async (req: express.Request, res: express.Response) => {
    try {
        const pictures = req.files?.files as UploadedFile[] || [];
        const { name, description, price, category, location } = req.body;
        const tags = req.body['tags[]'] || req.body.tags || [];

        const { status, message, item } = await Item.create(
            name,
            description,
            price,
            pictures,
            category,
            tags,
            (req as any).user.userId,
            location
        );

        if (!status) {
            return handleError(res, 400, message);
        }

        res.status(201).json({ message: 'Item created successfully!' });

        addLog(LogType.CREATE_ITEM, (req as any).user.userId, [
            { itemId: item?._id },
            { name: item?.name },
            { description: item?.description },
            { price: item?.price },
            { category: item?.category },
            { location: item?.location },
            { tags: item?.tags },
            { ownerId: (req as any).user.userId },
            { userAgent: req.headers['user-agent'] },
        ]);
    } catch (error) {
        handleError(res, 500, 'Failed to create item');
    }
});

router.delete('/:id', middleware, async (req: express.Request, res: express.Response) => {
    try {
        const item: Item | null = await Item.findById(req.params.id);
        if (!item) {
            return handleError(res, 404, 'Item not found');
        }

        if (item.ownerId.toString() !== (req as any).user.userId) {
            return handleError(res, 403, 'Forbidden');
        }

        await Item.deleteById(req.params.id);
        res.json({ message: 'Item deleted successfully!' });

        addLog(LogType.DELETE_ITEM, (req as any).user.userId, [
            { itemId: item._id },
            { userAgent: req.headers['user-agent'] },
        ]);
    } catch (error) {
        handleError(res, 500, 'Failed to delete item');
    }
});

export default router;
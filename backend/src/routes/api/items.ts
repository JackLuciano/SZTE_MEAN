import express from 'express';
import { Item } from '../../models/item';
import { middleware, optionalMiddleware } from '../protected';
import { ObjectId } from 'mongodb';
import { UploadedFile } from 'express-fileupload';
import { addLog } from '../../models/log';
import { LogType } from '../../data/logTypes';
import { User } from '../../models/user';
import { handleError } from '../../models/error';

const router = express.Router();

router.get('/', async (req: express.Request, res: express.Response) => {
    try {
        const items: Item[] = await Item.getAllItems();
        res.json(items);
    } catch (error: any) {
        console.error('Error fetching items:', error);
        handleError(res, 500, 'Failed to fetch items');
    }
});

router.get('/my-items', middleware, async (req: express.Request, res: express.Response) => {
    try {
        const items: Item[] = await Item.getAllItemsByOwner((req as any).user.userId);
        res.json(items);
    } catch (error: any) {
        console.error('Error fetching items:', error);
        handleError(res, 500, 'Failed to fetch items');
    }
});

router.get('/:id', optionalMiddleware, async (req: express.Request, res: express.Response) => {
    try {
        const item: Item | null = await Item.findById(req.params.id);
        if (!item) {
            return handleError(res, 404, 'Item not found');
        }

        if (item.isDeleted) {
            const ownerId = item.ownerId;
            const userId : ObjectId | null = (req as any).user?.userId;
            if (!userId) {
                return handleError(res, 401, 'Unauthorized');
            }

            if (!ownerId.equals(new ObjectId(userId))) {
                return handleError(res, 404, 'Item not found');
            }
        }

        res.json(item);
    } catch (error: any) {
        console.error('Error fetching item:', error);
        handleError(res, 500, 'Failed to fetch item');
    }
});

router.post('/buy/:id', middleware, async (req: express.Request, res: express.Response) => {
    try {
        const item: Item | null = await Item.findById(req.params.id);
        if (!item) {
            return handleError(res, 404, 'Item not found');
        }

        if (item.ownerId.toString() === (req as any).user.userId) {
            return handleError(res, 403, 'Forbidden');
        }

        if (item.isSold) {
            return handleError(res, 400, 'Item already sold');
        }

        const price = item.price;
        const userId = (req as any).user.userId;
        const user : User | null = await User.findById(userId);
        if (!user) {
            return handleError(res, 401, 'Unauthorized');
        }

        const owner: User | null = await User.findById(item.ownerId);
        if (!owner) {
            return handleError(res, 404, 'Owner not found');   
        }

        if (user.balance < price) {
            return handleError(res, 400, 'Insufficient balance');
        }

        user.balance -= price;
        await user.save();

        owner.balance += price;
        await owner.save();

        await Item.buy(req.params.id, (req as any).user.userId);
        res.json({ message: 'Item bought successfully!' });

        addLog(LogType.BUY_ITEM, (req as any).user.userId, [
            { itemId: item._id },
            { userAgent: req.headers['user-agent'] },
        ]);
    } catch (error: any) {
        console.error('Error buying item:', error);
        handleError(res, 500, 'Failed to buy item');
    }
})

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
    } catch (error: any) {
        console.error('Error creating item:', error);
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
    } catch (error: any) {
        console.error('Error deleting item:', error);
        handleError(res, 500, 'Failed to delete item');
    }
});

export default router;
import express from 'express';
import { Item } from '../../models/item';
import { middleware } from '../protected';

const router = express.Router();

router.get('/', async (req: express.Request, res: express.Response) => {
    const items: Item[] = await Item.getAllItems();

    res.json(items);
});

router.get('/:id', async (req: express.Request, res: express.Response) => {
    const item : Item | null = await Item.findById(req.params.id);
    if (!item) {
        res.status(404).json({ message: 'Item not found' });

        return;
    }

    res.json(item);
});

router.post('/', middleware, async (req: express.Request, res: express.Response) => {
    res.json({ message: 'Item created' });
});

export default router;
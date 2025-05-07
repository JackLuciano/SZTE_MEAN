import express from 'express';
import { Item } from '../../models/item';

const router = express.Router();

router.get('/', async (req: express.Request, res: express.Response) => {
    const items: Item[] = await Item.getAllItems();

    // if (!items || items.length === 0) {
    //     const response = await Item.create("test", "description", 100, [], "clothing", ["asd", "asd123"], "Hungary");
    //     console.log(response)
    // }

    res.json(items);
});

export default router;
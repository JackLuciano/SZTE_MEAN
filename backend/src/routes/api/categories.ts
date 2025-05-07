import express from 'express';
import { categories } from '../../data/categories';

const router = express.Router();

router.get('/', (req: express.Request, res: express.Response) => {
    res.json(categories);
});

export default router;
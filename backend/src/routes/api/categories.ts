import express, { Request, Response, Router } from 'express';
import { categories } from '../../data/categories';

const router: Router = express.Router();

router.get('/', (req: Request, res: Response): void => {
    res.status(200).json(categories);
});

export default router;
import { app, PORT } from './config';
import { connectToDatabase } from './db';

import healthRoute from './routes/health';
import authRoutes from './routes/auth';
import protectedRoutes from './routes/protected';
import categoriesRoute from './routes/api/categories';
import itemsRoute from './routes/api/items';
import messagesRoute from './routes/api/messages';
import logRoute from './routes/api/logs';
import profileRoute from './routes/api/profile';

const registerRoutes = () => {
    const routes = [
        { path: '/health', handler: healthRoute },
        { path: '/auth', handler: authRoutes },
        { path: '/api', handler: protectedRoutes },
        { path: '/api/messages', handler: messagesRoute },
        { path: '/api/logs', handler: logRoute },
        { path: '/api/profile/', handler: profileRoute },
        { path: '/categories', handler: categoriesRoute },
        { path: '/items', handler: itemsRoute },
    ];

    routes.forEach(({ path, handler }) => app.use(path, handler));
};

const startServer = async () => {
    try {
        await connectToDatabase();
        registerRoutes();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Failed to connect to database:', err);
        process.exit(1);
    }
};

startServer();

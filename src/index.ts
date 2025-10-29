import "reflect-metadata";
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AppDataSource } from './data-source';
import authRoutes from './routes/auth';
import requisicoesRoutes from './routes/requisicoesRoutes';
import inventoryRoutes from './routes/inventoryRoutes';
import suppliersRoutes from './routes/suppliersRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
    origin: 'http://localhost:5173',
}));
app.use(express.json());

AppDataSource.initialize()
    .then(() => {
        console.log("Database connection initialized successfully!");
        app.use('/api/auth', authRoutes);
        app.use('/api/requisicoes', requisicoesRoutes);
    app.use('/api/inventory', inventoryRoutes);
    // Also accept Portuguese path for legacy frontends
    app.use('/api/inventario', inventoryRoutes);
    app.use('/api/suppliers', suppliersRoutes); // Register suppliers routes
        // Add a simple health check route
        app.get('/', (req, res) => {
            res.json({ message: 'Server is running', timestamp: new Date().toISOString() });
        });

        app.get('/health', (req, res) => {
            res.json({ status: 'OK', database: AppDataSource.isInitialized });
        });

        const server = app.listen(Number(PORT), '127.0.0.1', () => {
            console.log(`Server is running on http://127.0.0.1:${PORT}`);
            console.log(`Local access: http://localhost:${PORT}`);
            console.log(`Health check: http://localhost:${PORT}/health`);
            console.log(`CORS enabled for: http://localhost:5173`);
        });

        server.on('error', (error) => {
            console.error('Server startup error:', error);
        });
    })
    .catch((error) => console.error("Database connection error:", error));
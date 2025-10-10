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
        app.use('/api/suppliers', suppliersRoutes); // Register suppliers routes
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => console.error("Database connection error:", error));
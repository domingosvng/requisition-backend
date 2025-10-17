import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entity/User";
import { Requisicao } from "./entity/Requisicao";
import { Fornecedor } from "./entity/Fornecedor";
import { ItemInventario } from "./entity/ItemInventario";
import dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    // Disable automatic schema synchronization to prevent unexpected ALTERs; use migrations in production
    synchronize: false,
    logging: false,
    entities: [User, Requisicao, Fornecedor, ItemInventario],
    migrations: [],
    subscribers: [],
});
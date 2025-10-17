"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const User_1 = require("./entity/User");
const Requisicao_1 = require("./entity/Requisicao");
const Fornecedor_1 = require("./entity/Fornecedor");
const ItemInventario_1 = require("./entity/ItemInventario");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    // Disable automatic schema synchronization to prevent unexpected ALTERs; use migrations in production
    synchronize: false,
    logging: false,
    entities: [User_1.User, Requisicao_1.Requisicao, Fornecedor_1.Fornecedor, ItemInventario_1.ItemInventario],
    migrations: [],
    subscribers: [],
});

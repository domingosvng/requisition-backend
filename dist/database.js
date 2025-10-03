"use strict";
// src/database.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv")); // Para carregar variáveis de ambiente
// Carregar variáveis de ambiente do ficheiro .env
dotenv_1.default.config();
// Configurações da base de dados
const pool = new pg_1.Pool({
    user: process.env.DB_USER, // O seu utilizador da base de dados (geralmente 'postgres')
    host: process.env.DB_HOST || 'localhost', // O host da base de dados (geralmente 'localhost')
    database: process.env.DB_DATABASE, // O nome da base de dados que criou (ex: 'gestao_requisicoes_db')
    password: process.env.DB_PASSWORD, // A senha do seu utilizador da base de dados
    port: parseInt(process.env.DB_PORT || '5432', 10), // A porta do PostgreSQL (padrão é 5432)
});
// Função para testar a conexão com a base de dados
const connectDb = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield pool.connect();
        console.log('Conexão com a base de dados PostgreSQL estabelecida com sucesso!');
    }
    catch (err) {
        console.error('Erro ao conectar à base de dados PostgreSQL:', err);
        process.exit(1); // Sai da aplicação se houver um erro de conexão
    }
});
// **Esta é a nova e única linha de exportação padrão**
exports.default = { pool, connectDb };

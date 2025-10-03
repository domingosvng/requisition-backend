"use strict";
// src/routes/requisicoesRoutes.ts
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
const express_1 = require("express");
const database_1 = __importDefault(require("../database")); // Importa o objeto 'db' que contém o pool
const router = (0, express_1.Router)();
// Rota para CRIAR uma nova requisição (POST /api/requisicoes)
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { descricao, quantidade, unidade, estado } = req.body; // Extrai os dados do corpo da requisição
    try {
        const result = yield database_1.default.pool.query(// Use db.pool para a query
        'INSERT INTO requisicoes (descricao, quantidade, unidade, estado) VALUES ($1, $2, $3, $4) RETURNING *', [descricao, quantidade, unidade, estado]);
        res.status(201).json(result.rows[0]); // Retorna a requisição recém-criada
    }
    catch (error) {
        console.error('Erro ao criar requisição:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao criar requisição.' });
    }
}));
// Rota para OBTER TODAS as requisições (GET /api/requisicoes) - AGORA COM DADOS REAIS!
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield database_1.default.pool.query('SELECT * FROM requisicoes ORDER BY data_criacao DESC'); // Query para selecionar todos os dados
        res.status(200).json(result.rows); // Retorna todas as linhas encontradas
    }
    catch (error) {
        console.error('Erro ao obter requisições:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao obter requisições.' });
    }
}));
// Rota para OBTER UMA requisição específica por ID (GET /api/requisicoes/:id)
router.get('/:id', (req, res) => {
    const { id } = req.params;
    console.log(`Requisição recebida para obter requisição com ID: ${id}`);
    res.status(200).json({ message: `Detalhes da requisição ${id} (placeholder)` });
});
// Rota para ATUALIZAR uma requisição específica por ID (PUT /api/requisicoes/:id)
router.put('/:id', (req, res) => {
    const { id } = req.params;
    console.log(`Requisição recebida para atualizar requisição com ID: ${id}`, req.body);
    res.status(200).json({ message: `Requisição ${id} atualizada com sucesso (placeholder)` });
});
// Rota para APAGAR uma requisição específica por ID (DELETE /api/requisicoes/:id)
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    console.log(`Requisição recebida para apagar requisição com ID: ${id}`);
    res.status(200).json({ message: `Requisição ${id} apagada com sucesso (placeholder)` });
});
exports.default = router;

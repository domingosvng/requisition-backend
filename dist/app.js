"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/app.ts
const express_1 = __importDefault(require("express"));
const database_1 = __importDefault(require("./database")); // Importa o objeto padrão que contém pool e connectDb
const requisicoesRoutes_1 = __importDefault(require("./routes/requisicoesRoutes"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
app.use(express_1.default.json());
// Conectar à base de dados quando a aplicação inicia
database_1.default.connectDb(); // Chame a função a partir do objeto importado
// Exemplo de rota de teste (pode remover ou manter)
app.get('/', (req, res) => {
    res.send('API de Gestão de Requisições, Fornecedores e Inventário está a funcionar!');
});
// Usar as rotas de requisições
app.use('/api/requisicoes', requisicoesRoutes_1.default);
// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor backend a correr em http://localhost:${port}`);
});

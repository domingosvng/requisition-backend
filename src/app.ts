// src/app.ts
import express from 'express';
import db from './database'; // Importa o objeto padrão que contém pool e connectDb
import requisicoesRoutes from './routes/requisicoesRoutes';
import inventoryRoutes from './routes/inventoryRoutes';
import suppliersRoutes from './routes/suppliersRoutes';

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

// Conectar à base de dados quando a aplicação inicia
db.connectDb(); // Chame a função a partir do objeto importado

// Exemplo de rota de teste (pode remover ou manter)
app.get('/', (req, res) => {
  res.send('API de Gestão de Requisições, Fornecedores e Inventário está a funcionar!');
});

// Usar as rotas de requisições
app.use('/api/requisicoes', requisicoesRoutes);
// Mount inventory and suppliers routes
app.use('/api/inventario', inventoryRoutes);
app.use('/api/suppliers', suppliersRoutes);

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor backend a correr em http://localhost:${port}`);
});
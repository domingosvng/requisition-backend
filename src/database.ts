// src/database.ts

import { Pool } from 'pg';
import dotenv from 'dotenv'; // Para carregar variáveis de ambiente

// Carregar variáveis de ambiente do ficheiro .env
dotenv.config();

// Configurações da base de dados
const pool = new Pool({
  user: process.env.DB_USER, // O seu utilizador da base de dados (geralmente 'postgres')
  host: process.env.DB_HOST || 'localhost', // O host da base de dados (geralmente 'localhost')
  database: process.env.DB_DATABASE, // O nome da base de dados que criou (ex: 'gestao_requisicoes_db')
  password: process.env.DB_PASSWORD, // A senha do seu utilizador da base de dados
  port: parseInt(process.env.DB_PORT || '5432', 10), // A porta do PostgreSQL (padrão é 5432)
});

// Função para testar a conexão com a base de dados
const connectDb = async () => { // **Não tem 'export' aqui**
  try {
    await pool.connect();
    console.log('Conexão com a base de dados PostgreSQL estabelecida com sucesso!');
  } catch (err) {
    console.error('Erro ao conectar à base de dados PostgreSQL:', err);
    process.exit(1); // Sai da aplicação se houver um erro de conexão
  }
};

// **Esta é a nova e única linha de exportação padrão**
export default { pool, connectDb };
import React, { useEffect, useState } from 'react';
import apiService from '../services/apiService';
import { Container, Typography, Table, TableHead, TableRow, TableCell, TableBody, Button } from '@mui/material';

function Dashboard({ userRole }) {
  const [requisicoes, setRequisicoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRequisicoes = async () => {
      try {
        const response = await apiService.get('/requisicoes');
        setRequisicoes(response.data);
        setError('');
      } catch (err) {
        setError('Falha ao carregar requisições. Verifique o console.');
        setRequisicoes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRequisicoes();
  }, []);

  if (loading) return <Typography>Carregando Requisições...</Typography>;
  if (error) return <Typography color="error">Erro: {error}</Typography>;

  return (
    <Container maxWidth="md">
      <Typography variant="h4" sx={{ mt: 4 }}>Painel - {userRole}</Typography>
      <Typography variant="h6" sx={{ mt: 2 }}>Sua Lista de Requisições</Typography>
      {requisicoes.length === 0 ? (
        <Typography>Nenhuma requisição encontrada para o seu perfil.</Typography>
      ) : (
        <Table sx={{ mt: 2 }}>
          <TableHead>
            <TableRow>
        <Typography variant="h4" sx={{ mt: 4 }}>Painel - {roleMap[userRole] || userRole}</Typography>
              <TableCell>Nº Requisição</TableCell>
              <TableCell>Área</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requisicoes.map((req) => (
              <TableRow key={req.id}>
                <TableCell>{req.id}</TableCell>
                <TableCell>{req.numeroRequisicao}</TableCell>
                <TableCell>{req.areaSolicitante}</TableCell>
                <TableCell>{req.status}</TableCell>
                <TableCell>
                  {/* TODO: Add View/Edit Button */}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
                  <TableCell>{req.status}</TableCell>
      {userRole === 'requester' && (
        <Button variant="contained" color="primary" sx={{ mt: 3 }}>
          Criar Nova Requisição
        </Button>
      )}
      {/* TODO: Add Manager/Admin Action Panel here later */}
    </Container>
  );
        {userRole === 'SOLICITANTE' && (

export default Dashboard;

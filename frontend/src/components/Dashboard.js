import React, { useEffect, useMemo, useState } from 'react';
import apiService from '../services/apiService';
import { Container, Typography, Table, TableHead, TableRow, TableCell, TableBody, Button, TextField } from '@mui/material';

function Dashboard({ userRole }) {
  const [requisicoes, setRequisicoes] = useState([]);
  const [query, setQuery] = useState('');
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

  const filteredRequisicoes = useMemo(() => {
    const q = (query || '').trim().toLowerCase();
    if (!q) return requisicoes;
    return requisicoes.filter((req) => {
      // normalize all compared fields to strings and lowercase
      const idStr = String(req.id || '').toLowerCase();
      if (idStr.includes(q)) return true;
      if (String(req.numeroRequisicao || '').toLowerCase().includes(q)) return true;
      if (String(req.areaSolicitante || '').toLowerCase().includes(q)) return true;
      if (String(req.status || '').toLowerCase().includes(q)) return true;
      // also check solicitante name/email if present
      if (req.solicitante) {
        if (String(req.solicitante.nome || '').toLowerCase().includes(q)) return true;
        if (String(req.solicitante.email || '').toLowerCase().includes(q)) return true;
      }
      return false;
    });
  }, [requisicoes, query]);

  return (
    <Container maxWidth="md">
      <Typography variant="h4" sx={{ mt: 4 }}>Painel - {userRole}</Typography>
      <TextField
        label="Pesquisar requisições"
        placeholder="Pesquisar por número, área ou status"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        fullWidth
        variant="outlined"
        sx={{ mt: 2 }}
        size="small"
      />
      <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>{filteredRequisicoes.length} resultado(s){query ? ` para "${query}"` : ''}</Typography>
      <Typography variant="h6" sx={{ mt: 2 }}>Sua Lista de Requisições</Typography>
      {filteredRequisicoes.length === 0 ? (
        <Typography>Nenhuma requisição encontrada para o seu filtro.</Typography>
      ) : (
        <Table sx={{ mt: 2 }}>
          <TableHead>
            <TableRow>
              <TableCell>Nº Requisição</TableCell>
              <TableCell>Área</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRequisicoes.map((req) => (
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
      )}
      {userRole === 'requester' && (
        <Button variant="contained" color="primary" sx={{ mt: 3 }}>
          Criar Nova Requisição
        </Button>
      )}
      {/* TODO: Add Manager/Admin Action Panel here later */}
    </Container>
  );
}

export default Dashboard;

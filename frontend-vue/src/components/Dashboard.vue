<template>
  <div>
    <h2 style="color:#fff;">Dashboard</h2>
    <div class="user-info-panel">
      <span style="color:#fff; font-size:1.1em;">
        Usuário: <strong>{{ username }}</strong> | Papel: <strong>{{ roleDisplay }}</strong>
      </span>
    </div>
    <div v-if="loading">Carregando requisições...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <table v-if="requisicoes.length" class="dashboard-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Número</th>
          <th>Status</th>
          <th>Solicitante</th>
          <th>Área</th>
          <th>Urgência</th>
          <th>Observações</th>
          <th>Fornecedor</th>
          <th>Justificativa Rejeição</th>
          <th>Comentário Aprovação</th>
          <th>Responsável Processamento</th>
          <th>Itens</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="req in requisicoes" :key="req.id" :class="{ 'active-row': req.status === 'APROVADA' }">
          <td>{{ req.id }}</td>
          <td>{{ req.numeroRequisicao }}</td>
          <td :class="{ 'status-aprovada': req.status === 'APROVADA' }">{{ req.status }}</td>
          <td>{{ req.solicitante?.username }}</td>
          <td>{{ req.areaSolicitante }}</td>
          <td>{{ req.urgencia }}</td>
          <td>{{ req.observacoes }}</td>
          <td>{{ req.fornecedorSugestaoId || '-' }}</td>
          <td>{{ req.justificativaRejeicao || '-' }}</td>
          <td>{{ req.comentarioAprovacao || '-' }}</td>
          <td>{{ req.responsavelProcessamentoId || '-' }}</td>
          <td>
            <table v-if="req.itens && req.itens.length" class="item-table" style="width:100%;">
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Qtd</th>
                  <th>Especificações</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in req.itens" :key="item.itemId || item.nome">
                  <td>{{ item.descricao || item.nome }}</td>
                  <td>{{ item.quantidade }}</td>
                  <td>{{ item.especificacoes }}</td>
                </tr>
              </tbody>
            </table>
            <span v-else>Nenhum item</span>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-else style="color:#fff;">Nenhuma requisição encontrada.</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiService from '../services/apiService';

const props = defineProps({ userRole: String });
const requisicoes = ref([]);
const loading = ref(true);
const error = ref('');

const username = localStorage.getItem('username') || 'Usuário';
const userRole = localStorage.getItem('userRole');
const roleMap = {
  'SOLICITANTE': 'Solicitante',
  'ADMIN_TEC': 'Tec. Admin',
  'GESTOR_DADM': 'Gestor DADM',
  'ADMIN': 'Administrador'
};
const roleDisplay = roleMap[userRole] || userRole;

onMounted(async () => {
  try {
    const token = localStorage.getItem('userToken');
    const response = await apiService.get('/requisicoes', {
      headers: { Authorization: `Bearer ${token}` }
    });
    requisicoes.value = response.data;
  } catch (err) {
    error.value = err.response?.data?.message || 'Erro ao carregar requisições.';
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
table.dashboard-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  color: #fff;
  background: #181818;
}
th, td {
  border: 1px solid #444444;
  padding: 8px;
  text-align: left;
}
th {
  background: #3A004D;
  color: #fff;
}
td {
  color: #fff;
}
.error {
  color: #ff4d4f;
  margin-top: 16px;
}
.dashboard-table tr.active-row {
  border-left: 4px solid #CC0000;
}
.dashboard-table .status-aprovada {
  color: #CC0000;
  font-weight: bold;
}
.dashboard-table .item-table {
  background: #222222;
  color: #fff;
}
.user-info-panel {
  margin-bottom: 18px;
  padding: 12px 0;
  background: #3A004D;
  border-radius: 6px;
  text-align: center;
}
</style>
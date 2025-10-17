<template>
  <div class="dashboard-container">
    <h2>Dashboard</h2>
    <div class="user-info-panel">
      <span class="user-info-text">
        Usuário: <strong>{{ username }}</strong> | Papel: <strong>{{ roleDisplay }}</strong>
      </span>
    </div>
    <div v-if="serverError" class="alert alert-danger mt-4">
      Erro ao carregar requisições. Por favor, verifique o console do servidor.
      <p>Detalhe: {{ serverError }}</p>
    </div>
    <div v-else-if="!serverError && requisicoes.length === 0" class="alert alert-info mt-4">
      <template v-if="userRole === 'GESTOR_DADM'">Não há pedidos pendentes para aprovação.</template>
      <template v-else-if="userRole === 'ADMIN'">Nenhum pedido aguardando ação administrativa.</template>
      <template v-else>Use o botão "Novo Pedido" para criar um.</template>
    </div>
  <table v-else class="dashboard-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Número</th>
          <th>Status</th>
          <th>Solicitante</th>
          <th>Área</th>
          <th>Urgência</th>
          <th>Observações</th>
          <th>Comentário</th>
          <th>Itens</th>
          <th v-if="userRole === 'ADMIN' || userRole === 'GESTOR_DADM'">Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="req in requisicoes" :key="req.id" :class="{ 'active-row': req.status === 'APROVADA' }">
          <td>{{ req.id }}</td>
          <td>{{ req.numeroRequisicao }}</td>
          <td>
            <span :class="['status-badge', statusClass(req.status, req)]">{{ statusText(req) }}</span>
          </td>
          <td>{{ req.solicitante?.username }}</td>
          <td>{{ req.areaSolicitante }}</td>
          <td>{{ req.urgencia }}</td>
          <td>{{ req.observacoes }}</td>
          <td>{{ req.comentarioGestorDADM || req.comentarioAdmin || req.justificativaRejeicao || '-' }}</td>
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
          <td v-if="userRole === 'ADMIN'">
            <!-- Show approve/reject to admin for pending, awaiting final or manager-approved requests, but not for already rejected or fully approved -->
            <template v-if="req.status !== 'REJEITADA' && req.status !== 'APROVADA'">
              <button @click="openModal(req.id, 'APROVADA_FINAL')" class="btn btn-sm btn-success">Aprovar Final</button>
              <button @click="openModal(req.id, 'REJEITADA')" class="btn btn-sm btn-danger">Rejeitar</button>
            </template>
            <!-- Admin may still delete any requisition -->
            <button @click="deleteRequisicao(req.id)" class="btn btn-sm btn-dark mt-1">Eliminar</button>
          </td>
          <td v-else-if="userRole === 'GESTOR_DADM' && req.status === 'PENDENTE'">
            <button @click="updateStatus(req.id, 'AGUARDANDO_APROV_FINAL')" class="btn btn-sm btn-success">Aprovar</button>
            <button @click="updateStatus(req.id, 'REJEITADA')" class="btn btn-sm btn-danger">Rejeitar</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="approveModalVisible" class="modal-overlay">
      <div class="modal-content">
        <h3>Comentário de Aprovação Final</h3>
        <textarea v-model="approveComment" placeholder="Comentário ou observação..."></textarea>
        <div style="margin-top:10px;">
          <button @click="confirmApprove" class="btn-final-approve">Confirmar Aprovação</button>
          <button @click="closeApproveModal" class="btn-cancel">Cancelar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiService from '../services/apiService';

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

const approveModalVisible = ref(false);
const approveComment = ref('');
let approveId = null;

onMounted(async () => {
  await fetchRequisitions();
});

async function fetchRequisitions() {
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
}

function openModal(id, status) {
  approveId = id;
  approveComment.value = '';
  approveModalVisible.value = true;
}

function closeApproveModal() {
  approveModalVisible.value = false;
  approveId = null;
}

async function confirmApprove() {
  if (approveId) {
    await updateStatus(approveId, 'APROVADA_FINAL', approveComment.value);
    closeApproveModal();
  }
}

async function updateStatus(id, newStatus, comentario = '') {
  const token = localStorage.getItem('userToken');
  try {
    await apiService.put(`/requisicoes/${id}/status`, {
      newStatus,
      comentario,
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    alert(`Requisição ${id} atualizada para ${newStatus}.`);
    await fetchRequisitions();
  } catch (error) {
    alert(error.response?.data?.message || 'Falha ao atualizar status.');
  }
}

function deleteRequisicao(id) {
  if (confirm(`Tem certeza que deseja ELIMINAR a requisição ${id}? Ação irreversível.`)) {
    updateStatus(id, 'DELETE', 'Eliminação permanente pelo Admin');
  }
}
</script>

<script>
export default {
  methods: {
    statusClass(status, req) {
      // return class name only (styles handled in CSS)
      switch (status) {
        case 'PENDENTE': return 'status-pendente';
        case 'AGUARDANDO_APROV_FINAL': return 'status-pendente';
        case 'APROVADA_GERENCIA': return 'status-aprovada-gest';
        case 'APROVADA': return req.lastActionRole === 'ADMIN' ? 'status-aprovada-admin' : 'status-aprovada-gest';
        case 'REJEITADA': return 'status-rejeitada';
        default: return '';
      }
    },
    statusText(req) {
      // Admin-approved should display 'APROVADA' (all green)
      if (req.status === 'APROVADA') return 'APROVADA';
      // Manager-approved labels
      if (req.status === 'APROVADA_GERENCIA') return 'APROVADA - GEST.';
      if (req.status === 'AGUARDANDO_APROV_FINAL') return 'APROVADA - GEST.';
      if (req.status === 'PENDENTE') return 'PENDENTE';
      if (req.status === 'REJEITADA') return 'REJEITADA';
      return req.status;
    }
  }
}
</script>

<style scoped>
body {
  background: #f7f7fa;
}
.dashboard-container {
  background: #ffffff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  color: #2a2a2a;
}
.dashboard-container h2 {
  color: #3A004D;
  margin: 0 0 12px 0;
}
.user-info-text {
  color: #3A004D;
  font-size: 1.05em;
}
.dashboard-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  color: #3A004D;
  background: #fff;
  box-shadow: 0 2px 8px #ccc;
}
th, td {
  border: 1px solid #d1c4e9;
  padding: 8px;
  text-align: left;
}
th {
  background: #e1bee7;
  color: #3A004D;
}
td {
  color: #3A004D;
}
.dashboard-table tr.active-row {
  border-left: 4px solid #CC0000;
}
.dashboard-table .status-aprovada {
  color: #CC0000;
  font-weight: bold;
}
.dashboard-table .item-table {
  background: #ede7f6;
  color: #3A004D;
}
.user-info-panel {
  margin-bottom: 18px;
  padding: 12px 0;
  background: #e1bee7;
  border-radius: 6px;
  text-align: center;
}
.btn {
  font-size: 0.95em;
  padding: 6px 14px;
  border-radius: 4px;
  margin-right: 4px;
  border: none;
  cursor: pointer;
}
.btn-success {
  background: #43a047;
  color: #fff;
}
.btn-danger {
  background: #e53935;
  color: #fff;
}
.btn-dark {
  background: #3A004D;
  color: #fff;
}
.btn-sm {
  font-size: 0.9em;
  padding: 4px 10px;
}
.mt-1 {
  margin-top: 6px;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px #3A004D;
  color: #3A004D;
  min-width: 320px;
}
.modal-content textarea {
  width: 100%;
  min-height: 60px;
  margin-bottom: 8px;
  border-radius: 4px;
  border: 1px solid #d1c4e9;
  background: #ede7f6;
  color: #3A004D;
  padding: 8px;
}
.btn-final-approve {
  background: #3A004D;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  margin-right: 8px;
  cursor: pointer;
}
.btn-cancel {
  background: #d1c4e9;
  color: #3A004D;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}
/* Status badges */
.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  color: #fff;
  font-weight: 600;
}
.status-pendente {
  background: linear-gradient(90deg, #3fb0ff 0%, #1e90ff 100%);
  padding: 10px 24px;
  border-radius: 28px;
  font-size: 0.95em;
}
.status-aprovada-gest {
  /* Green -> Yellow gradient for manager-approved */
  background: linear-gradient(90deg, #1fa65a 0%, #f6c23e 100%);
  padding: 10px 24px;
  border-radius: 28px;
  font-size: 0.95em;
}
.status-aprovada-admin {
  /* Solid full green for admin-approved (no gradient) */
  background: #2e7d32; /* solid green */
  color: #fff;
  padding: 10px 24px;
  border-radius: 28px;
  font-size: 0.95em;
}
.status-rejeitada {
  background: linear-gradient(90deg, #ff3e3e 0%, #ff1a1a 100%);
  padding: 10px 24px;
  border-radius: 28px;
  font-size: 0.95em;
}
</style>
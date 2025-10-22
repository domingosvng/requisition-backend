<template>
  <div class="dashboard-container">
    <h2>Dashboard</h2>
    <div class="status-legend" title="Legenda: aprovação pelo gestor é diferente da aprovação final pelo administrador">
      <span class="legend-item"><span class="legend-swatch gest"></span> Aprovação (Gestor)</span>
      <span class="legend-item"><span class="legend-swatch admin"></span> Aprovação (Admin)</span>
    </div>
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
              <!-- Admin final approval uses solid green -->
              <button @click="openModal(req.id, 'APROVADA_FINAL')" class="btn btn-sm btn-admin-approve">Aprovar Final</button>
              <!-- Reject uses red -->
              <button @click="openModal(req.id, 'REJEITADA')" class="btn btn-sm btn-danger">Rejeitar</button>
            </template>
            <!-- Admin may still delete any requisition (use light blue to stay within 4-color palette) -->
            <button @click="deleteRequisicao(req.id)" class="btn btn-sm btn-pending mt-1">Eliminar</button>
          </td>
          <td v-else-if="userRole === 'GESTOR_DADM' && req.status === 'PENDENTE'">
            <!-- Manager approve uses light green -->
            <button @click="updateStatus(req.id, 'AGUARDANDO_APROV_FINAL')" class="btn btn-sm btn-manager-approve">Aprovar</button>
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
        // AGUARDANDO_APROV_FINAL is displayed as 'Aprovada-Gestor' => use the manager-approved color
        case 'AGUARDANDO_APROV_FINAL': return 'status-aprovada-gest';
        case 'APROVADA_GERENCIA': return 'status-aprovada-gest';
  // Ensure APROVADA always uses the admin solid-green color
  case 'APROVADA': return 'status-aprovada-admin';
        case 'REJEITADA': return 'status-rejeitada';
        default: return '';
      }
    },
    statusText(req) {
      // Admin-approved should display 'APROVADA' (all green)
    if (req.status === 'APROVADA') return 'APROVADA';
    // Manager-approved labels
    if (req.status === 'APROVADA_GERENCIA') return 'Aprovada-Gestor';
    if (req.status === 'AGUARDANDO_APROV_FINAL') return 'Aprovada-Gestor';
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
.status-legend {
  margin-top: 8px;
  display: flex;
  gap: 12px;
  align-items: center;
  font-size: 0.95em;
  color: #3A004D;
}
.legend-item { display:flex; align-items:center; gap:8px; }
.legend-swatch { width:18px; height:12px; border-radius:4px; display:inline-block; border:1px solid #dcdcdc }
.legend-swatch.gest { background: linear-gradient(90deg, #90ee90 0%, #81c784 100%); }
.legend-swatch.admin { background: #28a745; }
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
  /* visually mark approved rows with a green accent */
  border-left: 4px solid #28a745; /* admin green */
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
  /* Approve actions - use the same green family as status badges */
  --approve-start: #81c784; /* manager light */
  --approve-end: #43a047; /* actionable green */
  background: linear-gradient(90deg, var(--approve-start) 0%, var(--approve-end) 100%);
  color: #fff;
  box-shadow: 0 1px 0 rgba(0,0,0,0.12);
}
.btn-success:hover, .btn-success:focus {
  filter: brightness(0.95);
  transform: translateY(-1px);
}
.btn-danger {
  /* Reject actions - consistent red */
  background: linear-gradient(90deg, #ff6b6b 0%, #e53935 100%);
  color: #fff;
  box-shadow: 0 1px 0 rgba(0,0,0,0.12);
}
.btn-danger:hover, .btn-danger:focus {
  filter: brightness(0.95);
  transform: translateY(-1px);
}
.btn-dark {
  /* Brand / Cancel / Delete actions use the purple brand color */
  background: linear-gradient(90deg, #5e2b6e 0%, #3A004D 100%);
  color: #fff;
  box-shadow: 0 1px 0 rgba(0,0,0,0.12);
}
.btn-dark:hover, .btn-dark:focus {
  filter: brightness(0.97);
  transform: translateY(-1px);
}

/* 4-color palette mapping:
   - Light green: manager approval (btn-manager-approve, status-aprovada-gest)
   - Solid green: admin approval (btn-admin-approve, status-aprovada-admin)
   - Light blue: pending / action (btn-pending, status-pendente)
   - Red: rejected (btn-danger, status-rejeitada)
*/
.btn-manager-approve {
  background: linear-gradient(90deg, #c8e6c9 0%, #81c784 100%); /* light green */
  color: #fff;
}
.btn-admin-approve {
  background: linear-gradient(90deg, #28a745 0%, #28a745 100%); /* solid green */
  color: #fff;
}
.btn-pending {
  background: linear-gradient(90deg, #d8eeff 0%, #87cefa 100%); /* light blue */
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
  /* Confirm button in modal should highlight admin brand but be clearly an approve action */
  background: linear-gradient(90deg, #2e7d32 0%, #3A004D 100%);
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  margin-right: 8px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(58,0,77,0.12);
}
.btn-final-approve:hover, .btn-final-approve:focus {
  filter: brightness(0.95);
  transform: translateY(-1px);
}
.btn-cancel {
  background: #f1e7f6;
  color: #3A004D;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid rgba(58,0,77,0.06);
}
.btn-cancel:hover, .btn-cancel:focus {
  background: #e9def0;
}
/* Status badges */
/* Base style to ensure text is bold and centered */
.status-badge, .status-tag {
  display: inline-block;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 6px;
  text-align: center;
  white-space: nowrap;
  font-size: 0.95em;
}

/* User-provided palette (uppercase class names) */
.status-REJEITADA { background-color: #dc3545; color: #fff; }
.status-PENDENTE { background-color: #add8e6; color: #222; }
.status-APROVADA-GESTOR { background-color: #90ee90; color: #222; }
.status-APROVADA { background-color: #28a745; color: #fff; }

/* Map existing lowercase/hyphen classes used in template to the same colors */
.status-rejeitada { background-color: #dc3545; color: #fff; }
.status-pendente { background-color: #add8e6; color: #222; }
.status-aprovada-gest { background-color: #90ee90; color: #222; }
.status-aprovada-admin { background-color: #28a745; color: #fff; }
</style>
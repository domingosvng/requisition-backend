// Script to update Dashboard component with single observações column and distinct approve/accept actions
const fs = require('fs');
const path = require('path');

const content = `<template>
    <div class="container mt-4">
        <h2>Dashboard</h2>
        <div style="display:flex; gap:10px; align-items:center; margin-bottom:1rem;">
            <span class="badge bg-primary">Aprovação (Gestor)</span>
            <span class="badge bg-success">Aprovação (Admin)</span>
            <div class="user-info">
                <strong>Usuário:</strong> {{ currentUser }} | <strong>Papel:</strong> {{ userRole }}
            </div>
        </div>

        <table class="table table-dark table-striped table-bordered table-hover">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Número</th>
                    <th>Status</th>
                    <th>Solicitante</th>
                    <th>Área</th>
                    <th>Urgência</th>
                    <th>Observações</th>
                    <th>Itens</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="req in filteredRequisitions" :key="req.id">
                    <td>{{ req.id }}</td>
                    <td>{{ req.numeroRequisicao }}</td>
                    <td>
                        <span :class="getStatusClass(req.status)">
                            {{ getStatusText(req.status) }}
                        </span>
                    </td>
                    <td>{{ req.solicitante?.username || 'N/A' }}</td>
                    <td>{{ req.areaSolicitante || '-' }}</td>
                    <td>
                        <span :class="getUrgencyClass(req.urgencia)">
                            {{ req.urgencia }}
                        </span>
                    </td>
                    <td style="max-width:200px; word-break:break-word">{{ req.observacoes || '-' }}</td>
                    <td>
                        <div v-if="req.itens && req.itens.length > 0">
                            <div v-for="(item, index) in req.itens" :key="index" class="item-card">
                                <div><strong>Descrição:</strong> {{ item.descricao || item.nome || '-' }}</div>
                                <div><strong>Qtd:</strong> {{ item.quantidade }}</div>
                                <div><strong>Especificações:</strong> {{ item.especificacoes || '-' }}</div>
                            </div>
                        </div>
                        <div v-else>-</div>
                    </td>
                    <td>
                        <!-- Manager Actions (First Level Approval) -->
                        <div v-if="canApprove && req.status === 'PENDENTE'" class="action-buttons">
                            <button @click="approveRequisition(req.id)" 
                                    style="background-color: #007bff !important; color: white !important; border: 1px solid #007bff !important; padding: 4px 8px; border-radius: 4px; font-size: 0.875rem; cursor: pointer;">
                                Aprovar
                            </button>
                            <button @click="rejectRequisition(req.id)" 
                                    style="background-color: #dc3545 !important; color: white !important; border: 1px solid #dc3545 !important; padding: 4px 8px; border-radius: 4px; font-size: 0.875rem; cursor: pointer;">
                                Rejeitar
                            </button>
                        </div>
                        
                        <!-- Admin Actions (Final Acceptance) -->
                        <!-- Allow ADMIN to accept/reject when request is awaiting final approval OR when it's still pending (admin may shortcut manager) or already approved by manager -->
                        <div v-if="canAccept && (req.status === 'AGUARDANDO_APROV_FINAL' || req.status === 'PENDENTE' || req.status === 'APROVADA_GERENCIA')" class="action-buttons">
                            <button @click="acceptRequisition(req.id)" 
                                    style="background-color: #28a745 !important; color: white !important; border: 1px solid #28a745 !important; padding: 4px 8px; border-radius: 4px; font-size: 0.875rem; cursor: pointer;">
                                Aceitar
                            </button>
                            <button @click="rejectRequisition(req.id)" 
                                    style="background-color: #dc3545 !important; color: white !important; border: 1px solid #dc3545 !important; padding: 4px 8px; border-radius: 4px; font-size: 0.875rem; cursor: pointer;">
                                Rejeitar
                            </button>
                        </div>
                        
                        <!-- Admin Delete (Any Status) -->
                        <div v-if="canDelete" class="action-buttons">
                            <button @click="deleteRequisition(req.id)" class="btn-delete">
                                Eliminar
                            </button>
                        </div>
                        
                        <!-- No Actions Available -->
                        <div v-if="!canApprove && !canAccept && !canDelete" class="text-muted">
                            Sem ações
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
        
        <div v-if="requisitions.length === 0" class="alert alert-info mt-4">
            Nenhuma requisição encontrada.
        </div>
        
        <!-- Action Modal -->
        <div v-if="showActionModal" class="modal-overlay" @click="closeModal">
            <div class="modal-content" @click.stop>
                <h4>{{ modalTitle }}</h4>
                <div class="form-group">
                    <label for="actionComment">Comentário:</label>
                    <textarea 
                        id="actionComment" 
                        v-model="actionComment" 
                        class="form-control" 
                        rows="3"
                        placeholder="Adicione um comentário (opcional)"
                    ></textarea>
                </div>
                <div class="modal-actions">
                    <button @click="confirmAction" class="btn-confirm">Confirmar</button>
                    <button @click="closeModal" class="btn-cancel">Cancelar</button>
                </div>
                <div v-if="actionError" class="alert alert-danger mt-2">{{ actionError }}</div>
            </div>
        </div>
    </div>
</template>

<script>
import apiService from '../services/apiService';

export default {
    data() {
        return {
            requisitions: [],
            showActionModal: false,
            modalTitle: '',
            actionComment: '',
            actionError: '',
            currentAction: null,
            currentReqId: null
        };
    },
    computed: {
        currentUser() {
            return localStorage.getItem('username') || 'Usuário';
        },
        userRole() {
            return localStorage.getItem('userRole') || 'N/A';
        },
        canApprove() {
            return this.userRole === 'GESTOR_DADM';
        },
        canAccept() {
            return this.userRole === 'ADMIN';
        },
        canDelete() {
            return this.userRole === 'ADMIN';
        },
        filteredRequisitions() {
            // Show requisitions based on user role
            if (this.userRole === 'SOLICITANTE') {
                const currentUsername = localStorage.getItem('username');
                return this.requisitions.filter(req => {
                    return req.solicitante?.username === currentUsername;
                });
            }
            return this.requisitions;
        }
    },
    mounted() {
        this.fetchRequisitions();
    },
    methods: {
        async fetchRequisitions() {
            try {
                const token = localStorage.getItem('userToken');
                const response = await apiService.get('/requisicoes', {
                    headers: { Authorization: \`Bearer \${token}\` }
                });
                this.requisitions = response.data;
            } catch (error) {
                console.error('Erro ao carregar requisições:', error);
            }
        },
        
        getStatusClass(status) {
            const statusClasses = {
                'PENDENTE': 'badge bg-warning text-dark',
                'AGUARDANDO_APROV_FINAL': 'badge bg-primary',
                'APROVADA': 'badge bg-success',
                'REJEITADA': 'badge bg-danger',
                'EM_PROCESSAMENTO': 'badge bg-primary',
                'CONCLUIDA': 'badge bg-secondary'
            };
            return statusClasses[status] || 'badge bg-light text-dark';
        },
        
        getStatusText(status) {
            const statusTexts = {
                'PENDENTE': 'Pendente',
                'AGUARDANDO_APROV_FINAL': 'Aguardando Aprovação Final',
                'APROVADA': 'Aprovada',
                'REJEITADA': 'Rejeitada',
                'EM_PROCESSAMENTO': 'Em Processamento',
                'CONCLUIDA': 'Concluída'
            };
            return statusTexts[status] || status;
        },
        
        getUrgencyClass(urgencia) {
            const urgencyClasses = {
                'BAIXA': 'badge bg-secondary',
                'MEDIA': 'badge bg-warning text-dark',
                'ALTA': 'badge bg-danger'
            };
            return urgencyClasses[urgencia] || 'badge bg-light text-dark';
        },
        
        approveRequisition(reqId) {
            this.currentAction = 'approve';
            this.currentReqId = reqId;
            this.modalTitle = 'Aprovar Requisição';
            this.showActionModal = true;
        },
        
        acceptRequisition(reqId) {
            this.currentAction = 'accept';
            this.currentReqId = reqId;
            this.modalTitle = 'Aceitar Requisição';
            this.showActionModal = true;
        },
        
        rejectRequisition(reqId) {
            this.currentAction = 'reject';
            this.currentReqId = reqId;
            this.modalTitle = 'Rejeitar Requisição';
            this.showActionModal = true;
        },
        
        deleteRequisition(reqId) {
            if (!confirm('Tem certeza que deseja eliminar esta requisição?')) return;
            this.performDelete(reqId);
        },
        
        async confirmAction() {
            if (!this.currentAction || !this.currentReqId) return;
            
            this.actionError = '';
            const token = localStorage.getItem('userToken');
            
            try {
                let endpoint = '';
                let method = 'PUT';
                let data = { comentario: this.actionComment };
                
                switch (this.currentAction) {
                    case 'approve':
                        endpoint = \`/requisicoes/\${this.currentReqId}/approve\`;
                        break;
                    case 'accept':
                        endpoint = \`/requisicoes/\${this.currentReqId}/accept\`;
                        break;
                    case 'reject':
                        endpoint = \`/requisicoes/\${this.currentReqId}/reject\`;
                        data = { comment: this.actionComment };
                        break;
                }
                
                const response = await apiService.request({
                    method,
                    url: endpoint,
                    data,
                    headers: { Authorization: \`Bearer \${token}\` }
                });
                
                // Show notification if present (e.g., when Admin bypasses Gestor approval)
                if (response.data.notification) {
                    alert(response.data.notification);
                }
                
                this.closeModal();
                this.fetchRequisitions(); // Refresh the list
                
            } catch (error) {
                console.error('Erro na ação:', error);
                this.actionError = error.response?.data?.message || 'Erro ao executar ação';
            }
        },
        
        async performDelete(reqId) {
            try {
                const token = localStorage.getItem('userToken');
                await apiService.delete(\`/requisicoes/\${reqId}\`, {
                    headers: { Authorization: \`Bearer \${token}\` }
                });
                this.fetchRequisitions(); // Refresh the list
            } catch (error) {
                console.error('Erro ao eliminar requisição:', error);
                alert('Erro ao eliminar requisição: ' + (error.response?.data?.message || error.message));
            }
        },
        
        closeModal() {
            this.showActionModal = false;
            this.modalTitle = '';
            this.actionComment = '';
            this.actionError = '';
            this.currentAction = null;
            this.currentReqId = null;
        }
    }
}
</script>

<style scoped>
.container {
    max-width: 1400px;
}

table { 
    width: 100%; 
    border-collapse: collapse; 
}

th, td { 
    border: 1px solid #ccc; 
    padding: 8px; 
    text-align: left;
}

.user-info {
    margin-left: auto;
    color: #333;
    background: #f8f9fa;
    padding: 8px 12px;
    border-radius: 4px;
}

.item-card {
    background: #f8f9fa;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 8px;
    margin-bottom: 4px;
    font-size: 0.9em;
}

.action-buttons {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

/* Action Button Styles */
.btn-approve {
    background-color: #007bff !important;
    color: white !important;
    border: 1px solid #007bff !important;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.875rem;
    cursor: pointer;
    transition: background-color 0.2s;
}

.btn-approve:hover {
    background-color: #0056b3;
    border-color: #004085;
}

.btn-accept {
    background-color: #28a745 !important;
    color: white !important;
    border: 1px solid #28a745 !important;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.875rem;
    cursor: pointer;
    transition: background-color 0.2s;
}

.btn-accept:hover {
    background-color: #218838;
    border-color: #1e7e34;
}

.btn-reject {
    background-color: #dc3545;
    color: white;
    border: 1px solid #dc3545;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.875rem;
    cursor: pointer;
    transition: background-color 0.2s;
}

.btn-reject:hover {
    background-color: #c82333;
    border-color: #bd2130;
}

.btn-delete {
    background-color: #6c757d;
    color: white;
    border: 1px solid #6c757d;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.875rem;
    cursor: pointer;
    transition: background-color 0.2s;
    margin-top: 4px;
}

.btn-delete:hover {
    background-color: #545b62;
    border-color: #4e555b;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    border-radius: 8px;
    padding: 24px;
    min-width: 400px;
    max-width: 600px;
}

.form-group {
    margin-bottom: 16px;
}

.form-group label {
    display: block;
    margin-bottom: 4px;
    font-weight: bold;
}

.form-control {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.modal-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
}

.btn-confirm {
    background-color: #007bff;
    color: white;
    border: 1px solid #007bff;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.btn-confirm:hover {
    background-color: #0056b3;
    border-color: #004085;
}

.btn-cancel {
    background-color: #6c757d;
    color: white;
    border: 1px solid #6c757d;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.btn-cancel:hover {
    background-color: #545b62;
    border-color: #4e555b;
}

.badge {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.8em;
    font-weight: bold;
}

.bg-warning { background-color: #ffc107 !important; }
.bg-info { background-color: #17a2b8 !important; color: white; }
.bg-success { background-color: #28a745 !important; color: white; }
.bg-danger { background-color: #dc3545 !important; color: white; }
.bg-primary { background-color: #007bff !important; color: white; }
.bg-secondary { background-color: #6c757d !important; color: white; }
.text-dark { color: #343a40 !important; }
</style>
`;

const frontendPath = 'C:\\\\Users\\\\domin\\\\Documents\\\\requisition-frontend\\\\src\\\\components\\\\Dashboard.vue';
fs.writeFileSync(frontendPath, content, 'utf8');
console.log('✅ Dashboard.vue updated with single Observações column and distinct Approve/Accept actions!');
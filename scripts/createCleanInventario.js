// Simple script to create a minimal working Inventario.vue without dev mode
const fs = require('fs');
const path = require('path');

const inventarioPath = 'C:\\Users\\domin\\Documents\\requisition-frontend\\src\\components\\Inventario.vue';

const minimalInventarioContent = `<template>
    <div class="container mt-4">
        <h2>Inventário</h2>
        
        <div v-if="!hasToken" class="alert alert-warning">
            <strong>⚠️ Autenticação Necessária</strong><br>
            Por favor, faça login primeiro para aceder ao inventário.
            <router-link to="/login" class="btn btn-primary ms-2">Ir para Login</router-link>
        </div>
        
        <div v-else>
            <div class="mb-3">
                <button @click="fetchInventario" class="btn btn-primary me-2">🔄 Actualizar Inventário</button>
                <button @click="showAddModal = true" class="btn btn-success">➕ Adicionar Item</button>
            </div>
            
            <div v-if="loading" class="text-center my-4">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Carregando...</span>
                </div>
            </div>
            
            <div v-else-if="inventario.length === 0" class="alert alert-info">
                Nenhum item no inventário.
            </div>
            
            <div v-else class="table-responsive">
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nome</th>
                            <th>Descrição</th>
                            <th>Quantidade</th>
                            <th>Preço Unitário</th>
                            <th>Fornecedor</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in inventario" :key="item.id">
                            <td>{{ item.id }}</td>
                            <td>{{ item.nome }}</td>
                            <td>{{ item.descricao || '-' }}</td>
                            <td>{{ item.quantidade }}</td>
                            <td>{{ formatCurrency(item.precoUnitario) }}</td>
                            <td>{{ item.fornecedor?.nome || '-' }}</td>
                            <td>
                                <button @click="editItem(item)" class="btn btn-sm btn-outline-primary me-1">Editar</button>
                                <button @click="deleteItem(item.id)" class="btn btn-sm btn-outline-danger">Eliminar</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- Add Item Modal -->
        <div v-if="showAddModal" class="modal d-block" style="background-color: rgba(0,0,0,0.5)">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Adicionar Item</h5>
                        <button type="button" class="btn-close" @click="closeAddModal"></button>
                    </div>
                    <div class="modal-body">
                        <form @submit.prevent="addItem">
                            <div class="mb-3">
                                <label class="form-label">Nome *</label>
                                <input v-model="newItem.nome" type="text" class="form-control" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Descrição</label>
                                <textarea v-model="newItem.descricao" class="form-control"></textarea>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Quantidade *</label>
                                <input v-model.number="newItem.quantidade" type="number" class="form-control" required min="0">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Preço Unitário *</label>
                                <input v-model.number="newItem.precoUnitario" type="number" step="0.01" class="form-control" required min="0">
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" @click="closeAddModal">Cancelar</button>
                        <button type="button" class="btn btn-primary" @click="addItem">Adicionar</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import apiService from '../services/apiService.js';

export default {
    name: 'Inventario',
    data() {
        return {
            inventario: [],
            loading: false,
            showAddModal: false,
            newItem: {
                nome: '',
                descricao: '',
                quantidade: 0,
                precoUnitario: 0
            }
        };
    },
    computed: {
        hasToken() {
            return !!localStorage.getItem('userToken');
        }
    },
    mounted() {
        if (this.hasToken) {
            this.fetchInventario();
        }
    },
    methods: {
        async fetchInventario() {
            if (!this.hasToken) return;
            
            this.loading = true;
            try {
                const token = localStorage.getItem('userToken');
                const response = await apiService.get('/inventario', {
                    headers: { Authorization: \`Bearer \${token}\` }
                });
                this.inventario = response.data;
            } catch (error) {
                console.error('Erro ao carregar inventário:', error);
                if (error.response?.status === 401) {
                    localStorage.removeItem('userToken');
                    this.$router.push('/login');
                }
            } finally {
                this.loading = false;
            }
        },
        
        async addItem() {
            if (!this.hasToken) return;
            
            try {
                const token = localStorage.getItem('userToken');
                await apiService.post('/inventario', this.newItem, {
                    headers: { Authorization: \`Bearer \${token}\` }
                });
                this.closeAddModal();
                this.fetchInventario();
            } catch (error) {
                console.error('Erro ao adicionar item:', error);
                alert('Erro ao adicionar item: ' + (error.response?.data?.message || error.message));
            }
        },
        
        async deleteItem(id) {
            if (!this.hasToken || !confirm('Tem certeza que deseja eliminar este item?')) return;
            
            try {
                const token = localStorage.getItem('userToken');
                await apiService.delete(\`/inventario/\${id}\`, {
                    headers: { Authorization: \`Bearer \${token}\` }
                });
                this.fetchInventario();
            } catch (error) {
                console.error('Erro ao eliminar item:', error);
                alert('Erro ao eliminar item: ' + (error.response?.data?.message || error.message));
            }
        },
        
        editItem(item) {
            // TODO: Implement edit functionality
            console.log('Edit item:', item);
        },
        
        closeAddModal() {
            this.showAddModal = false;
            this.newItem = {
                nome: '',
                descricao: '',
                quantidade: 0,
                precoUnitario: 0
            };
        },
        
        formatCurrency(value) {
            return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'EUR'
            }).format(value || 0);
        }
    }
};
</script>

<style scoped>
.container {
    max-width: 1200px;
}

.table {
    background-color: white;
}

.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1050;
}
</style>`;

function createCleanInventario() {
    try {
        fs.writeFileSync(inventarioPath, minimalInventarioContent, 'utf8');
        console.log('✅ Created clean Inventario.vue without dev mode');
        return true;
    } catch (error) {
        console.error('❌ Error creating clean Inventario.vue:', error.message);
        return false;
    }
}

console.log('🔧 Creating clean Inventario.vue...');
createCleanInventario();
console.log('✅ Clean Inventario.vue created successfully!');
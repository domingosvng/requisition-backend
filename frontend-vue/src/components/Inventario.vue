<template>
    <div class="container mt-4">
        <h2>Inventário Actual</h2>
        <div style="display:flex; gap:10px; align-items:center; margin-bottom:1rem;">
            <button v-if="canManage" class="btn btn-primary" @click="showAddForm" data-test="add-item-btn">Adicionar Item</button>
            <input v-model="searchQuery" placeholder="Pesquisar inventário..." class="form-control" style="max-width:320px;" />
        </div>
        <table class="table table-dark table-striped table-bordered table-hover">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>Descrição</th>
                    <th>Categoria</th>
                    <th>Qtd</th>
                    <th>Unid.</th>
                    <th>Localização</th>
                    <th>Data Entrada</th>
                    <th>Última Saída</th>
                    <th>Fornecedor</th>
                    <th>Valor Unit.</th>
                    <th>Estado</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in filtered" :key="item.id">
                    <td>{{ item.id }}</td>
                    <td>{{ item.nome }}</td>
                    <td style="max-width:240px; white-space:normal;">{{ item.descricao || '-' }}</td>
                    <td>{{ (item.categoria || []).join(', ') }}</td>
                    <td>{{ item.quantidade }}</td>
                    <td>{{ item.unidadeMedida || '-' }}</td>
                    <td>{{ item.localizacao || '-' }}</td>
                    <td>{{ formatDate(item.dataEntrada) }}</td>
                    <td>{{ formatDate(item.dataUltimaSaida) }}</td>
                    <td>{{ item.fornecedor?.nome || item.fornecedor || '-' }}</td>
                    <td>{{ item.valorUnitario != null ? item.valorUnitario : '-' }}</td>
                    <td>{{ item.status || '-' }}</td>
                    <td>
                        <button v-if="canManage" @click="editItem(item)" class="btn btn-sm btn-warning me-2">Editar</button>
                        <button v-if="canManage" @click="deleteItem(item.id)" class="btn btn-sm btn-danger">Eliminar</button>
                    </td>
                </tr>
            </tbody>
        </table>
        <div v-if="inventario.length === 0" class="alert alert-info mt-4">Nenhum item de inventário encontrado.</div>

            <!-- Inline form -->
            <div v-if="showForm" class="card mt-4 p-3" style="background:#fff;color:#333;">
                <h3 v-if="isEditing">Editar Item</h3>
                <h3 v-else>Adicionar Item</h3>
                <div v-if="serverError" class="alert alert-danger">{{ serverError }}</div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                            <input v-model="form.nome" placeholder="Nome" class="form-control" />
                            <input v-model.number="form.quantidade" placeholder="Quantidade" class="form-control" type="number" />
                            <input v-model="form.descricao" placeholder="Descrição" class="form-control" />
                            <input v-model="form.categoriaText" placeholder="Categorias (vírgula)" class="form-control" @change="form.categoria = form.categoriaText.split(',').map(s=>s.trim())" />
                            <input v-model="form.unidadeMedida" placeholder="Unidade de Medida" class="form-control" />
                            <input v-model="form.localizacao" placeholder="Localização" class="form-control" />
                            <input v-model="form.dataEntrada" placeholder="Data Entrada (YYYY-MM-DD)" class="form-control" />
                            <input v-model="form.dataUltimaSaida" placeholder="Última Saída (YYYY-MM-DD)" class="form-control" />
                            <input v-model="form.fornecedor" placeholder="Fornecedor" class="form-control" />
                            <input v-model.number="form.valorUnitario" placeholder="Valor Unitário" class="form-control" type="number" step="0.01" />
                            <select v-model="form.status" class="form-control">
                                <option value="ATIVO">ATIVO</option>
                                <option value="INATIVO">INATIVO</option>
                            </select>
                        </div>
                <div style="margin-top:8px;">
                    <button class="btn btn-success" @click="saveItem">Salvar</button>
                    <button class="btn btn-secondary" @click="resetForm">Cancelar</button>
                </div>
            </div>
    </div>
</template>

<script>
import axios from 'axios';
const API_URL = 'http://localhost:3001/api/inventario';
export default {
    data() {
        return {
            inventario: [],
            filtered: [],
            searchQuery: '',
            form: { id: null, nome: '', quantidade: 0, descricao: '', categoria: [], categoriaText: '', unidadeMedida: '', localizacao: '', dataEntrada: '', dataUltimaSaida: '', fornecedor: '', valorUnitario: null, status: 'ATIVO' },
            isEditing: false,
            showForm: false,
            serverError: '',
            categoriaOptions: ['Hardware','Software','Consumíveis','Serviços']
        };
    },
    computed: {
        canManage() {
            const role = localStorage.getItem('userRole');
            return role === 'ADMIN' || role === 'ADMIN_TEC';
        }
    },
    created() { this.fetchInventario(); },
    // Removed duplicate data() declarations
    watch: {
        searchQuery() { this.filterInventario(); }
    },
    methods: {
        async fetchInventario() {
            const token = localStorage.getItem('userToken');
            try {
                const response = await axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } });
                this.inventario = response.data;
                this.filtered = this.inventario.slice();
            } catch (error) { 
                console.error('Erro ao carregar inventário.', error);
                this.serverError = error.response?.data?.message || error.message || 'Erro ao carregar inventário.';
            }
        },
    editItem(item) { this.form = { ...item, categoriaText: (item.categoria||'').toString() }; this.isEditing = true; this.showForm = true; },
        async saveItem() {
            const token = localStorage.getItem('userToken');
            try {
                // Normalize payload
                const payload = { ...this.form };
                if (payload.categoriaText) {
                    payload.categoria = payload.categoriaText.split(',').map(s=>s.trim()).filter(Boolean);
                }
                payload.quantidade = Number(payload.quantidade || 0);
                if (payload.valorUnitario !== null && payload.valorUnitario !== undefined) payload.valorUnitario = Number(payload.valorUnitario);

                if (this.isEditing && this.form.id) {
                    await axios.put(`${API_URL}/${this.form.id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
                } else {
                    await axios.post(API_URL, payload, { headers: { Authorization: `Bearer ${token}` } });
                }
                this.resetForm();
                this.fetchInventario();
            } catch (err) {
                console.error('Erro ao salvar item', err);
                const msg = err.response?.data?.message || err.response?.data || err.message || 'Erro ao salvar item';
                alert(msg);
            }
        },
        async deleteItem(id) { 
            if (!confirm('Confirmar eliminação?')) return;
            const token = localStorage.getItem('userToken');
            try {
                await axios.delete(`${API_URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
                this.fetchInventario();
            } catch (err) {
                console.error('Erro ao apagar item', err);
                const msg = err.response?.data?.message || err.response?.data || err.message || 'Erro ao apagar item';
                alert(msg);
            }
        },
        resetForm() { this.form = { id: null, nome: '', quantidade: 0, descricao: '', categoria: [], categoriaText: '', unidadeMedida: '', localizacao: '', dataEntrada: '', dataUltimaSaida: '', fornecedor: '', valorUnitario: null, status: 'ATIVO' }; this.isEditing = false; this.showForm = false; },
        showAddForm() {
            console.log('showAddForm called');
            this.isEditing = false;
            this.resetForm();
            this.showForm = true;
        },
        filterInventario() {
            const q = this.searchQuery.trim().toLowerCase();
            if (!q) { this.filtered = this.inventario.slice(); return; }
            this.filtered = this.inventario.filter(i => (i.nome||'').toLowerCase().includes(q) || (i.descricao||'').toLowerCase().includes(q) || (i.categoria||[]).some(c=>c.toLowerCase().includes(q)));
        }
        ,formatDate(dateStr) {
            if (!dateStr) return '-';
            try { const d = new Date(dateStr); return d.toLocaleDateString(); } catch (e) { return dateStr; }
        }
    }
}
</script>

<style scoped>
table { width: 100%; border-collapse: collapse; }
th, td { border: 1px solid #ccc; padding: 8px; }
</style>

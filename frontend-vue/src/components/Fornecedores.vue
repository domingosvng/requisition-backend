<template>
    <div class="container mt-4">
        <h2>Lista de Fornecedores</h2>
        <div style="display:flex; gap:10px; align-items:center; margin-bottom:1rem;">
            <button class="btn btn-primary" @click="isEditing = false; resetForm(); showForm=true">Adicionar Fornecedor</button>
            <input v-model="searchQuery" placeholder="Pesquisar por nome, categoria..." class="form-control" style="max-width:320px;" @input="filterFornecedores" />
        </div>
    <table class="table table-dark table-striped table-bordered table-hover">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>NIF</th>
                    <th>Contacto</th>
                    <th>Email</th>
                    <th>Telefone</th>
                    <th>Endereço</th>
                    <th>Serviços/Produtos</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="forn in filtered" :key="forn.id">
                    <td>{{ forn.id }}</td>
                    <td>{{ forn.nome }}</td>
                    <td>{{ forn.nif }}</td>
                    <td>{{ forn.contactoPrincipal || '-' }}</td>
                    <td>{{ forn.email || '-' }}</td>
                    <td>{{ forn.telefone || '-' }}</td>
                    <td style="max-width:220px; word-break:break-word">{{ forn.endereco || '-' }}</td>
                    <td>{{ (forn.servicosFornecidos || []).join(', ') }}</td>
                    <td>
                        <button @click="editFornecedor(forn)" class="btn btn-sm btn-warning me-2">Editar</button>
                        <button @click="deleteFornecedor(forn.id)" class="btn btn-sm btn-danger">Eliminar</button>
                    </td>
                </tr>
            </tbody>
        </table>
        <div v-if="fornecedores.length === 0" class="alert alert-info mt-4">Nenhum fornecedor encontrado.</div>
        
            <!-- Inline form -->
            <div v-if="showForm" class="card mt-4 p-3" style="background:#fff;color:#333;">
                <h3 v-if="isEditing">Editar Fornecedor</h3>
                <h3 v-else>Adicionar Fornecedor</h3>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                    <input v-model="form.nome" placeholder="Nome" class="form-control" />
                    <input v-model="form.nif" placeholder="NIF" class="form-control" />
                    <input v-model="form.contactoPrincipal" placeholder="Contacto" class="form-control" />
                    <input v-model="form.email" placeholder="Email" class="form-control" />
                    <input v-model="form.telefone" placeholder="Telefone" class="form-control" />
                    <input v-model="form.endereco" placeholder="Endereço" class="form-control" />
                    <div style="grid-column:1 / -1;">
                        <label>Serviços/Produtos (separe com vírgula)</label>
                                <input v-model="form.servicosText" @change="form.servicosFornecidos = (form.servicosText || '').split(',').map(s=>s.trim()).filter(Boolean)" placeholder="Materiais, Serviços" class="form-control" />
                    </div>
                </div>
                <div style="margin-top:8px;">
                    <button class="btn btn-success" @click="saveFornecedor">Salvar</button>
                    <button class="btn btn-secondary" @click="resetForm">Cancelar</button>
                </div>
            </div>
    </div>
</template>

<script>
import axios from 'axios';
const API_URL = 'http://localhost:3001/api/suppliers';
export default {
    data() {
        return {
            fornecedores: [],
            filtered: [],
            searchQuery: '',
            form: { id: null, nome: '', nif: '', contactoPrincipal: '', email: '', telefone: '', endereco: '', servicosFornecidos: [], servicosText: '' },
            isEditing: false,
            showForm: false,
            serviceOptions: ['Materiais', 'Serviços', 'Transporte', 'Manutenção']
        };
    },
    created() { this.fetchFornecedores(); },
    methods: {
        async fetchFornecedores() {
            const token = localStorage.getItem('userToken');
            try {
                const response = await axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } });
                this.fornecedores = response.data;
                this.filtered = this.fornecedores.slice();
            } catch (error) { console.error('Erro ao carregar fornecedores.', error); }
        },
    editFornecedor(fornecedor) { this.form = { ...fornecedor, servicosFornecidos: fornecedor.servicosFornecidos || [], servicosText: (fornecedor.servicosFornecidos||[]).join(', ') }; this.isEditing = true; this.showForm = true; },
        async saveFornecedor() {
            const token = localStorage.getItem('userToken');
            // Ensure services array is set from text before sending
            if (typeof this.form.servicosFornecidos === 'string') {
                this.form.servicosFornecidos = (this.form.servicosFornecidos || '').split(',').map(s => s.trim()).filter(Boolean);
            }
            try {
                if (this.isEditing && this.form.id) {
                    await axios.put(`${API_URL}/${this.form.id}`, this.form, { headers: { Authorization: `Bearer ${token}` } });
                } else {
                    await axios.post(API_URL, this.form, { headers: { Authorization: `Bearer ${token}` } });
                }
                this.resetForm();
                this.fetchFornecedores();
            } catch (err) { 
                console.error('Erro ao salvar fornecedor', err);
                const msg = err.response?.data?.message || err.response?.data || err.message || 'Erro ao salvar fornecedor';
                alert(msg);
            }
        },
        async deleteFornecedor(id) { 
            if (!confirm('Confirmar eliminação?')) return;
            const token = localStorage.getItem('userToken');
            try {
                await axios.delete(`${API_URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
                this.fetchFornecedores();
            } catch (err) { 
                console.error('Erro ao apagar fornecedor', err);
                const msg = err.response?.data?.message || err.response?.data || err.message || 'Erro ao apagar fornecedor';
                alert(msg);
            }
        },
    resetForm() { this.form = { id: null, nome: '', nif: '', contactoPrincipal: '', email: '', telefone: '', endereco: '', servicosFornecidos: [], servicosText: '' }; this.isEditing = false; this.showForm = false; },
        filterFornecedores() {
            const q = this.searchQuery.trim().toLowerCase();
            if (!q) { this.filtered = this.fornecedores.slice(); return; }
            this.filtered = this.fornecedores.filter(f => {
                return (f.nome||'').toLowerCase().includes(q) 
                    || (f.nif||'').toLowerCase().includes(q)
                    || (f.contactoPrincipal||'').toLowerCase().includes(q)
                    || (f.email||'').toLowerCase().includes(q)
                    || (f.telefone||'').toLowerCase().includes(q)
                    || (f.endereco||'').toLowerCase().includes(q)
                    || (f.servicosFornecidos||[]).some(s => s.toLowerCase().includes(q));
            });
        }
    }
}
</script>

<style scoped>
table { width: 100%; border-collapse: collapse; }
th, td { border: 1px solid #ccc; padding: 8px; }
</style>

<template>
    <div class="container mt-4">
        <h2>Gestão de Fornecedores</h2>
        <div class="card mb-4">
            <div class="card-header bg-primary text-white">{{ isEditing ? 'Modificar Fornecedor' : 'Criar Novo Fornecedor' }}</div>
            <div class="card-body">
                <form @submit.prevent="saveFornecedor" class="row g-3">
                    <div class="col-md-6">
                        <label class="form-label">Nome:</label>
                        <input type="text" class="form-control" v-model="form.nome" required />
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">NIF:</label>
                        <input type="text" class="form-control" v-model="form.nif" required />
                    </div>
                    <div class="col-12">
                        <label class="form-label">Morada:</label>
                        <input type="text" class="form-control" v-model="form.morada" />
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Email:</label>
                        <input type="email" class="form-control" v-model="form.email" />
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Categoria de Serviços:</label>
                        <input type="text" class="form-control" v-model="form.categoriaServicos" />
                    </div>
                    <div class="col-12 text-end">
                        <button type="submit" class="btn btn-success me-2">{{ isEditing ? 'Guardar' : 'Criar Fornecedor' }}</button>
                        <button type="button" v-if="isEditing" @click="cancelEdit" class="btn btn-secondary">Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
        <h3>Lista de Fornecedores</h3>
        <table class="table table-striped table-bordered table-hover">
            <thead class="table-dark">
                <tr>
                    <th>Nome</th>
                    <th>NIF</th>
                    <th>Email</th>
                    <th>Categoria</th>
                    <th v-if="userRole === 'ADMIN_TEC'">Editar</th>
                    <th v-if="userRole === 'ADMIN_TEC'">Excluir</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="forn in fornecedores" :key="forn.id">
                    <td>{{ forn.nome }}</td>
                    <td>{{ forn.nif }}</td>
                    <td>{{ forn.email }}</td>
                    <td>{{ forn.categoriaServicos }}</td>
                    <td v-if="userRole === 'ADMIN_TEC'">
                        <button @click="editFornecedor(forn)" class="btn btn-sm btn-warning me-2">Modificar</button>
                    </td>
                    <td v-if="userRole === 'ADMIN_TEC'">
                        <button @click="deleteFornecedor(forn.id)" class="btn btn-sm btn-danger">Eliminar</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import axios from 'axios';
const API_URL = 'http://localhost:3001/api/fornecedores';

export default {
    data() {
        return {
            fornecedores: [],
            form: { id: null, nome: '', nif: '', morada: '', email: '', categoriaServicos: '' },
            isEditing: false,
            userRole: localStorage.getItem('userRole'),
        };
    },
    created() { this.fetchFornecedores(); },
    methods: {
        async fetchFornecedores() {
            const token = localStorage.getItem('userToken');
            try {
                const response = await axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } });
                this.fornecedores = response.data;
            } catch (error) { console.error('Erro ao carregar fornecedores.'); }
        },
        async saveFornecedor() {
            const token = localStorage.getItem('userToken');
            try {
                if (this.isEditing) {
                    await axios.put(`${API_URL}/${this.form.id}`, this.form, { headers: { Authorization: `Bearer ${token}` } });
                } else {
                    await axios.post(API_URL, this.form, { headers: { Authorization: `Bearer ${token}` } });
                }
                this.cancelEdit();
                this.fetchFornecedores();
            } catch (error) { alert('Erro ao salvar fornecedor.'); }
        },
        editFornecedor(forn) {
            this.isEditing = true;
            this.form = { ...forn };
        },
        cancelEdit() {
            this.isEditing = false;
            this.form = { id: null, nome: '', nif: '', morada: '', email: '', categoriaServicos: '' };
        },
        async deleteFornecedor(id) {
            const token = localStorage.getItem('userToken');
            try {
                await axios.delete(`${API_URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
                this.fetchFornecedores();
            } catch (error) { alert('Erro ao eliminar fornecedor.'); }
        },
    },
};
</script>

<style scoped>
table { width: 100%; border-collapse: collapse; }
th, td { border: 1px solid #ccc; padding: 8px; }
</style>

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
                    <div class="col-md-6">
                        <label class="form-label">Contacto Principal:</label>
                        <input type="text" class="form-control" v-model="form.contactoPrincipal" />
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Telefone:</label>
                        <input type="text" class="form-control" v-model="form.telefone" />
                    </div>
                    <div class="col-12">
                        <label class="form-label">Endereço:</label>
                        <input type="text" class="form-control" v-model="form.endereco" />
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Email:</label>
                        <input type="email" class="form-control" v-model="form.email" />
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Serviços Fornecidos (separados por vírgula):</label>
                        <input type="text" class="form-control" v-model="form.servicosFornecidos" />
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
                <tr><th>Nome</th><th>NIF</th><th>Email</th><th>Telefone</th><th>Serviços</th><th>Ações</th></tr>
            </thead>
            <tbody>
                <tr v-for="forn in fornecedores" :key="forn.id">
                    <td>{{ forn.nome }}</td>
                    <td>{{ forn.nif }}</td>
                    <td>{{ forn.email }}</td>
                    <td>{{ forn.telefone }}</td>
                    <td>{{ Array.isArray(forn.servicosFornecidos) ? forn.servicosFornecidos.join(', ') : forn.servicosFornecidos }}</td>
                    <td>
                        <button @click="editFornecedor(forn)" class="btn btn-sm btn-warning me-2">Modificar</button>
                        <button @click="deleteFornecedor(forn.id)" class="btn btn-sm btn-danger">Eliminar</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import axios from 'axios';
const API_URL = 'http://localhost:3001/api/suppliers';

export default {
    data() {
        return {
            fornecedores: [],
            form: { id: null, nome: '', nif: '', contactoPrincipal: '', telefone: '', endereco: '', email: '', servicosFornecidos: '' },
            isEditing: false,
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
                // Convert servicosFornecidos from string to array
                const formData = {
                    ...this.form,
                    servicosFornecidos: this.form.servicosFornecidos.split(',').map(s => s.trim()).filter(s => s)
                };
                if (this.isEditing) {
                    await axios.put(`${API_URL}/${this.form.id}`, formData, { headers: { Authorization: `Bearer ${token}` } });
                } else {
                    await axios.post(API_URL, formData, { headers: { Authorization: `Bearer ${token}` } });
                }
                this.resetForm();
                this.fetchFornecedores();
            } catch (error) { alert('Erro ao guardar fornecedor.'); }
        },
        async deleteFornecedor(id) {
            if (confirm('Tem certeza que deseja eliminar este fornecedor?')) {
                const token = localStorage.getItem('userToken');
                try {
                    await axios.delete(`${API_URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
                    this.fetchFornecedores();
                } catch (error) { alert('Erro ao eliminar fornecedor.'); }
            }
        },
        editFornecedor(fornecedor) { 
            this.form = { 
                ...fornecedor,
                servicosFornecidos: Array.isArray(fornecedor.servicosFornecidos) 
                    ? fornecedor.servicosFornecidos.join(', ') 
                    : fornecedor.servicosFornecidos 
            }; 
            this.isEditing = true; 
        },
        cancelEdit() { this.resetForm(); },
        resetForm() { this.form = { id: null, nome: '', nif: '', contactoPrincipal: '', telefone: '', endereco: '', email: '', servicosFornecidos: '' }; this.isEditing = false; },
    }
}
</script>

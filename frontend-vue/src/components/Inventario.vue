<template>
    <div class="container mt-4">
        <h2>Gestão de Inventário</h2>
        <div class="card mb-4">
            <div class="card-header bg-primary text-white">{{ isEditing ? 'Modificar Item' : 'Criar Novo Item' }}</div>
            <div class="card-body">
                <form @submit.prevent="saveItem" class="row g-3">
                    <div class="col-md-6">
                        <label class="form-label">Nome:</label>
                        <input type="text" class="form-control" v-model="form.nome" required />
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Quantidade:</label>
                        <input type="number" class="form-control" v-model.number="form.quantidade" required />
                    </div>
                    <div class="col-12">
                        <label class="form-label">Descrição:</label>
                        <textarea class="form-control" v-model="form.descricao"></textarea>
                    </div>
                    <div class="col-12 text-end">
                        <button type="submit" class="btn btn-success me-2">{{ isEditing ? 'Guardar' : 'Criar Item' }}</button>
                        <button type="button" v-if="isEditing" @click="cancelEdit" class="btn btn-secondary">Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
        <h3>Itens em Stock</h3>
        <table class="table table-striped table-bordered table-hover">
            <thead class="table-dark">
                <tr><th>Nome</th><th>Descrição</th><th>Qtd</th><th>Ações</th></tr>
            </thead>
            <tbody>
                <tr v-for="item in inventario" :key="item.id">
                    <td>{{ item.nome }}</td>
                    <td>{{ item.descricao }}</td>
                    <td>{{ item.quantidade }}</td>
                    <td>
                        <button @click="editItem(item)" class="btn btn-sm btn-warning me-2">Modificar</button>
                        <button @click="deleteItem(item.id)" class="btn btn-sm btn-danger">Eliminar</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import axios from 'axios';
const API_URL = 'http://localhost:3001/api/inventario';

export default {
    data() {
        return {
            inventario: [],
            form: { id: null, nome: '', descricao: '', quantidade: 0 },
            isEditing: false,
        };
    },
    created() { this.fetchInventario(); },
    methods: {
        async fetchInventario() {
            const token = localStorage.getItem('userToken');
            try {
                const response = await axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } });
                this.inventario = response.data;
            } catch (error) { console.error('Erro ao carregar inventário.'); }
        },
        async saveItem() {
            const token = localStorage.getItem('userToken');
            try {
                if (this.isEditing) {
                    await axios.put(`${API_URL}/${this.form.id}`, this.form, { headers: { Authorization: `Bearer ${token}` } });
                } else {
                    await axios.post(API_URL, this.form, { headers: { Authorization: `Bearer ${token}` } });
                }
                this.resetForm();
                this.fetchInventario();
            } catch (error) { alert('Erro ao guardar item.'); }
        },
        async deleteItem(id) {
            if (confirm('Tem certeza que deseja eliminar este item?')) {
                const token = localStorage.getItem('userToken');
                try {
                    await axios.delete(`${API_URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
                    this.fetchInventario();
                } catch (error) { alert('Erro ao eliminar item.'); }
            }
        },
        editItem(item) { this.form = { ...item }; this.isEditing = true; },
        cancelEdit() { this.resetForm(); },
        resetForm() { this.form = { id: null, nome: '', descricao: '', quantidade: 0 }; this.isEditing = false; },
    }
}
</script>

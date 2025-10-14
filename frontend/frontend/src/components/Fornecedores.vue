<template>
  <div>
    <h2>Fornecedores</h2>
    <div v-if="loading">Carregando...</div>
    <div v-else>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Contato</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="fornecedor in fornecedores" :key="fornecedor.id">
            <td>{{ fornecedor.id }}</td>
            <td>{{ fornecedor.nome }}</td>
            <td>{{ fornecedor.contato }}</td>
            <td>
              <button @click="editFornecedor(fornecedor)">Editar</button>
              <button @click="deleteFornecedor(fornecedor.id)">Excluir</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div>
        <h3>{{ editing ? 'Editar' : 'Novo' }} Fornecedor</h3>
        <input v-model="form.nome" placeholder="Nome" />
        <input v-model="form.contato" placeholder="Contato" />
        <button @click="saveFornecedor">Salvar</button>
        <button v-if="editing" @click="cancelEdit">Cancelar</button>
      </div>
    </div>
  </div>
</template>
<script>
import axios from 'axios';
export default {
  data() {
    return {
      fornecedores: [],
      loading: true,
      editing: false,
      form: { id: null, nome: '', contato: '' },
    };
  },
  mounted() {
    this.fetchFornecedores();
  },
  methods: {
    async fetchFornecedores() {
      this.loading = true;
      try {
        const res = await axios.get('/api/fornecedores');
        this.fornecedores = res.data;
      } finally {
        this.loading = false;
      }
    },
    editFornecedor(fornecedor) {
      this.editing = true;
      this.form = { ...fornecedor };
    },
    cancelEdit() {
      this.editing = false;
      this.form = { id: null, nome: '', contato: '' };
    },
    async saveFornecedor() {
      if (this.editing) {
        await axios.put(`/api/fornecedores/${this.form.id}`, this.form);
      } else {
        await axios.post('/api/fornecedores', this.form);
      }
      this.cancelEdit();
      this.fetchFornecedores();
    },
    async deleteFornecedor(id) {
      await axios.delete(`/api/fornecedores/${id}`);
      this.fetchFornecedores();
    },
  },
};
</script>
<style scoped>
table { width: 100%; border-collapse: collapse; }
th, td { border: 1px solid #ccc; padding: 8px; }
</style>

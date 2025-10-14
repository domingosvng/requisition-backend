<template>
  <div>
    <h2>Inventário</h2>
    <div v-if="loading">Carregando...</div>
    <div v-else>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Quantidade</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.nome }}</td>
            <td>{{ item.quantidade }}</td>
            <td>
              <button @click="editItem(item)">Editar</button>
              <button @click="deleteItem(item.id)">Excluir</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div>
        <h3>{{ editing ? 'Editar' : 'Novo' }} Item</h3>
        <input v-model="form.nome" placeholder="Nome" />
        <input v-model.number="form.quantidade" type="number" placeholder="Quantidade" />
        <button @click="saveItem">Salvar</button>
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
      items: [],
      loading: true,
      editing: false,
      form: { id: null, nome: '', quantidade: 0 },
    };
  },
  mounted() {
    this.fetchItems();
  },
  methods: {
    async fetchItems() {
      this.loading = true;
      try {
        const res = await axios.get('/api/inventario');
        this.items = res.data;
      } finally {
        this.loading = false;
      }
    },
    editItem(item) {
      this.editing = true;
      this.form = { ...item };
    },
    cancelEdit() {
      this.editing = false;
      this.form = { id: null, nome: '', quantidade: 0 };
    },
    async saveItem() {
      if (this.editing) {
        await axios.put(`/api/inventario/${this.form.id}`, this.form);
      } else {
        await axios.post('/api/inventario', this.form);
      }
      this.cancelEdit();
      this.fetchItems();
    },
    async deleteItem(id) {
      await axios.delete(`/api/inventario/${id}`);
      this.fetchItems();
    },
  },
};
</script>
<style scoped>
table { width: 100%; border-collapse: collapse; }
th, td { border: 1px solid #ccc; padding: 8px; }
</style>

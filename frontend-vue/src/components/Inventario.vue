<template>
  <div>
    <h2>Gestão de Inventário</h2>

    <form @submit.prevent="saveItem">
      <input type="text" v-model="form.nome" placeholder="Nome do Item" required />
      <input type="text" v-model="form.categoria" placeholder="Categoria" />
      <input type="number" v-model="form.quantidade" placeholder="Quantidade" required />
      <input type="text" v-model="form.unidadeMedida" placeholder="Unidade de Medida" />
      <input type="text" v-model="form.localizacao" placeholder="Localização" />
      <input type="text" v-model="form.status" placeholder="Status" />
      <button type="submit">{{ isEditing ? 'Guardar Alterações' : 'Criar Novo Item' }}</button>
      <button type="button" v-if="isEditing" @click="cancelEdit">Cancelar</button>
    </form>

    <hr>
    <h3>Lista de Itens</h3>
    <table>
      <thead>
        <tr>
          <th>Nome</th>
          <th>Categoria</th>
          <th>Quantidade</th>
          <th>Unidade</th>
          <th>Localização</th>
          <th>Status</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in itens" :key="item.id">
          <td>{{ item.nome }}</td>
          <td>{{ item.categoria }}</td>
          <td>{{ item.quantidade }}</td>
          <td>{{ item.unidadeMedida }}</td>
          <td>{{ item.localizacao }}</td>
          <td>{{ item.status }}</td>
          <td>
            <button @click="editItem(item)">Modificar</button>
            <button @click="deleteItem(item.id)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
const API_URL = 'http://localhost:3001/api/inventario';

const itens = ref([]);
const form = ref({ id: null, nome: '', categoria: '', quantidade: 0, unidadeMedida: '', localizacao: '', status: '' });
const isEditing = ref(false);

onMounted(() => {
  fetchItens();
});

async function fetchItens() {
  const token = localStorage.getItem('userToken');
  try {
    const response = await axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } });
    itens.value = response.data;
  } catch (error) {
    alert('Erro ao carregar itens do inventário.');
  }
}

async function saveItem() {
  const token = localStorage.getItem('userToken');
  try {
    if (isEditing.value) {
      await axios.put(`${API_URL}/${form.value.id}`, form.value, { headers: { Authorization: `Bearer ${token}` } });
    } else {
      await axios.post(API_URL, form.value, { headers: { Authorization: `Bearer ${token}` } });
    }
    resetForm();
    fetchItens();
  } catch (error) {
    alert('Erro ao guardar item.');
  }
}

async function deleteItem(id) {
  if (confirm('Tem certeza que deseja eliminar este item?')) {
    const token = localStorage.getItem('userToken');
    try {
      await axios.delete(`${API_URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchItens();
    } catch (error) {
      alert('Erro ao eliminar item.');
    }
  }
}

function editItem(item) {
  form.value = { ...item };
  isEditing.value = true;
}

function cancelEdit() {
  resetForm();
}

function resetForm() {
  form.value = { id: null, nome: '', categoria: '', quantidade: 0, unidadeMedida: '', localizacao: '', status: '' };
  isEditing.value = false;
}
</script>

<template>
  <div>
    <h2>Gestão de Fornecedores</h2>

    <form @submit.prevent="saveFornecedor">
      <input type="text" v-model="form.nome" placeholder="Nome" required />
      <input type="text" v-model="form.nif" placeholder="NIF" required />
      <input type="text" v-model="form.contactoPrincipal" placeholder="Contacto Principal" required />
      <input type="text" v-model="form.endereco" placeholder="Endereço" />
      <input type="email" v-model="form.email" placeholder="Email" />
      <input type="tel" v-model="form.telefone" placeholder="Telefone" />
      <input type="text" v-model="form.servicosFornecidos" placeholder="Serviços Fornecidos (separados por vírgula)" />
      <button type="submit">{{ isEditing ? 'Guardar Alterações' : 'Criar Novo Fornecedor' }}</button>
      <button type="button" v-if="isEditing" @click="cancelEdit">Cancelar</button>
    </form>

    <hr>
    <h3>Lista de Fornecedores</h3>
    <table>
      <thead>
        <tr>
          <th>Nome</th>
          <th>NIF</th>
          <th>Contacto</th>
          <th>Email</th>
          <th>Serviços</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="forn in fornecedores" :key="forn.id">
          <td>{{ forn.nome }}</td>
          <td>{{ forn.nif }}</td>
          <td>{{ forn.contactoPrincipal }}</td>
          <td>{{ forn.email }}</td>
          <td>{{ Array.isArray(forn.servicosFornecidos) ? forn.servicosFornecidos.join(', ') : forn.servicosFornecidos }}</td>
          <td>
            <button @click="editFornecedor(forn)">Modificar</button>
            <button @click="deleteFornecedor(forn.id)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
const API_URL = 'http://localhost:3001/api/fornecedores';

const fornecedores = ref([]);
const form = ref({ 
  id: null, 
  nome: '', 
  nif: '', 
  contactoPrincipal: '', 
  endereco: '', 
  email: '', 
  telefone: '', 
  servicosFornecidos: '' 
});
const isEditing = ref(false);

onMounted(() => {
  fetchFornecedores();
});

async function fetchFornecedores() {
  const token = localStorage.getItem('userToken');
  try {
    const response = await axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } });
    fornecedores.value = response.data;
  } catch (error) {
    alert('Erro ao carregar fornecedores.');
  }
}

async function saveFornecedor() {
  const token = localStorage.getItem('userToken');
  try {
    // Convert servicosFornecidos string to array
    const dataToSend = {
      ...form.value,
      servicosFornecidos: form.value.servicosFornecidos.split(',').map(s => s.trim())
    };
    if (isEditing.value) {
      await axios.put(`${API_URL}/${form.value.id}`, dataToSend, { headers: { Authorization: `Bearer ${token}` } });
    } else {
      await axios.post(API_URL, dataToSend, { headers: { Authorization: `Bearer ${token}` } });
    }
    resetForm();
    fetchFornecedores();
  } catch (error) {
    alert('Erro ao guardar fornecedor.');
  }
}

async function deleteFornecedor(id) {
  if (confirm('Tem certeza que deseja eliminar este fornecedor?')) {
    const token = localStorage.getItem('userToken');
    try {
      await axios.delete(`${API_URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchFornecedores();
    } catch (error) {
      alert('Erro ao eliminar fornecedor.');
    }
  }
}

function editFornecedor(fornecedor) {
  form.value = { 
    ...fornecedor,
    servicosFornecidos: Array.isArray(fornecedor.servicosFornecidos) 
      ? fornecedor.servicosFornecidos.join(', ') 
      : fornecedor.servicosFornecidos
  };
  isEditing.value = true;
}

function cancelEdit() {
  resetForm();
}

function resetForm() {
  form.value = { 
    id: null, 
    nome: '', 
    nif: '', 
    contactoPrincipal: '', 
    endereco: '', 
    email: '', 
    telefone: '', 
    servicosFornecidos: '' 
  };
  isEditing.value = false;
}
</script>

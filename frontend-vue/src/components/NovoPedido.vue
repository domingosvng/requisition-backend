<template>
  <div class="container mt-4">
    <h2>Criar Nova Requisição</h2>
    <form @submit.prevent="handleSubmit" class="requisition-form">
      <div class="form-group">
        <label for="descricao">Descrição Sumária:</label>
        <input type="text" id="descricao" v-model="form.descricao" required />
      </div>
      <div class="form-group">
        <label for="especificacoes">Especificações Detalhadas:</label>
        <textarea id="especificacoes" v-model="form.especificacoes" rows="4" required></textarea>
      </div>
      <div class="form-group">
        <label for="quantidade">Quantidade:</label>
        <input type="number" id="quantidade" v-model.number="form.quantidade" min="1" required />
      </div>
      <div class="form-group">
        <label for="urgencia">Nível de Urgência:</label>
        <select id="urgencia" v-model="form.urgencia" required>
          <option value="Alta">Alta</option>
          <option value="Média">Média</option>
          <option value="Baixa">Baixa</option>
        </select>
      </div>
      <div class="form-group">
        <label for="observacoes">Observações:</label>
        <textarea id="observacoes" v-model="form.observacoes" rows="2"></textarea>
      </div>
      <div class="form-group">
        <label for="area">Área Solicitante:</label>
        <select id="area" v-model="form.area" required>
          <option value="Administração">Administração</option>
          <option value="Financeiro">Financeiro</option>
          <option value="TI">TI</option>
          <option value="Marketing">Marketing</option>
        </select>
      </div>
      <button type="submit" class="submit-btn">Submeter Pedido</button>
      <p v-if="message" :class="messageType">{{ message }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
const API_URL = 'http://localhost:3001/api/requisicoes';
const form = ref({
  descricao: '',
  especificacoes: '',
  quantidade: 1,
  urgencia: 'Média',
  observacoes: '',
  area: 'Administração',
});
const message = ref('');
const messageType = ref('');
const handleSubmit = async () => {
  message.value = '';
  try {
    const token = localStorage.getItem('userToken');
    await axios.post(API_URL, form.value, {
      headers: { Authorization: `Bearer ${token}` },
    });
    message.value = 'Requisição submetida com sucesso! Aguardando aprovação.';
    messageType.value = 'success';
  form.value = { descricao: '', especificacoes: '', quantidade: 1, urgencia: 'Média', observacoes: '', area: 'Administração' };
  } catch (error) {
    message.value = error.response?.data?.message || 'Falha ao submeter requisição.';
    messageType.value = 'error';
  }
};
</script>

<style scoped>
.container {
  max-width: 500px;
  margin: 0 auto;
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
h2 {
  color: #3A004D;
  margin-bottom: 18px;
}
.form-group {
  margin-bottom: 16px;
}
label {
  font-weight: 500;
  color: #3A004D;
}
input, textarea, select {
  width: 100%;
  padding: 8px;
  margin-top: 4px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.submit-btn {
  background: #CC0000;
  color: #fff;
  border: none;
  padding: 10px 24px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}
.submit-btn:hover {
  background: #a30000;
}
.success {
  color: #42b883;
  margin-top: 12px;
}
.error {
  color: #ff4d4f;
  margin-top: 12px;
}
</style>

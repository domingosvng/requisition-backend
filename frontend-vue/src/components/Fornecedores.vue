<template>
  <div>
    <h2 style="color:#fff;">Gestão de Fornecedores</h2>
    
    <div class="form-container">
      <h3>{{ isEditing ? 'Modificar Fornecedor' : 'Criar Novo Fornecedor' }}</h3>
      <form @submit.prevent="saveFornecedor" class="supplier-form">
        <div class="form-group">
          <label for="nome">Nome:</label>
          <input type="text" id="nome" v-model="form.nome" required />
        </div>
        <div class="form-group">
          <label for="nif">NIF:</label>
          <input type="text" id="nif" v-model="form.nif" required />
        </div>
        <div class="form-group">
          <label for="contactoPrincipal">Contacto Principal:</label>
          <input type="text" id="contactoPrincipal" v-model="form.contactoPrincipal" />
        </div>
        <div class="form-group">
          <label for="telefone">Telefone:</label>
          <input type="text" id="telefone" v-model="form.telefone" />
        </div>
        <div class="form-group">
          <label for="endereco">Endereço:</label>
          <input type="text" id="endereco" v-model="form.endereco" />
        </div>
        <div class="form-group">
          <label for="email">Email:</label>
          <input type="email" id="email" v-model="form.email" />
        </div>
        <div class="form-group">
          <label for="servicosFornecidos">Serviços Fornecidos (separados por vírgula):</label>
          <input type="text" id="servicosFornecidos" v-model="form.servicosFornecidos" placeholder="Ex: Material de Escritório, Equipamento" />
        </div>
        <div class="button-group">
          <button type="submit" class="submit-btn">{{ isEditing ? 'Guardar' : 'Criar Fornecedor' }}</button>
          <button type="button" v-if="isEditing" @click="cancelEdit" class="cancel-btn">Cancelar</button>
        </div>
        <p v-if="message" :class="messageType">{{ message }}</p>
      </form>
    </div>

    <div class="table-container">
      <h3>Lista de Fornecedores</h3>
      <div v-if="fornecedores.length === 0" class="alert alert-info">
        Nenhum fornecedor cadastrado. Use o formulário acima para adicionar fornecedores.
      </div>
      <table v-else class="dashboard-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>NIF</th>
            <th>Email</th>
            <th>Telefone</th>
            <th>Serviços</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="forn in fornecedores" :key="forn.id">
            <td>{{ forn.nome }}</td>
            <td>{{ forn.nif }}</td>
            <td>{{ forn.email }}</td>
            <td>{{ forn.telefone }}</td>
            <td>{{ Array.isArray(forn.servicosFornecidos) ? forn.servicosFornecidos.join(', ') : forn.servicosFornecidos }}</td>
            <td>
              <button @click="editFornecedor(forn)" class="action-btn edit-btn">Modificar</button>
              <button @click="deleteFornecedor(forn.id)" class="action-btn delete-btn">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
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
            form: { id: null, nome: '', nif: '', contactoPrincipal: '', telefone: '', endereco: '', email: '', servicosFornecidos: '' },
            isEditing: false,
            message: '',
            messageType: '',
        };
    },
    created() { this.fetchFornecedores(); },
    methods: {
        async fetchFornecedores() {
            const token = localStorage.getItem('userToken');
            try {
                const response = await axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } });
                this.fornecedores = response.data;
            } catch (error) { 
                console.error('Erro ao carregar fornecedores:', error); 
            }
        },
        async saveFornecedor() {
            const token = localStorage.getItem('userToken');
            this.message = '';
            try {
                // Convert servicosFornecidos from string to array
                const formData = {
                    ...this.form,
                    servicosFornecidos: this.form.servicosFornecidos.split(',').map(s => s.trim()).filter(s => s)
                };
                if (this.isEditing) {
                    await axios.put(`${API_URL}/${this.form.id}`, formData, { headers: { Authorization: `Bearer ${token}` } });
                    this.message = 'Fornecedor atualizado com sucesso!';
                } else {
                    await axios.post(API_URL, formData, { headers: { Authorization: `Bearer ${token}` } });
                    this.message = 'Fornecedor criado com sucesso!';
                }
                this.messageType = 'success';
                this.resetForm();
                this.fetchFornecedores();
            } catch (error) { 
                this.message = error.response?.data?.message || 'Erro ao guardar fornecedor.';
                this.messageType = 'error';
            }
        },
        async deleteFornecedor(id) {
            if (confirm('Tem certeza que deseja eliminar este fornecedor?')) {
                const token = localStorage.getItem('userToken');
                try {
                    await axios.delete(`${API_URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
                    this.message = 'Fornecedor eliminado com sucesso!';
                    this.messageType = 'success';
                    this.fetchFornecedores();
                } catch (error) { 
                    this.message = 'Erro ao eliminar fornecedor.';
                    this.messageType = 'error';
                }
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
        resetForm() { 
            this.form = { id: null, nome: '', nif: '', contactoPrincipal: '', telefone: '', endereco: '', email: '', servicosFornecidos: '' }; 
            this.isEditing = false; 
            this.message = '';
        },
    }
}
</script>

<style scoped>
h2, h3 {
  color: #fff;
  margin-bottom: 18px;
}
.form-container {
  max-width: 600px;
  margin: 0 auto 40px;
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.form-container h3 {
  color: #3A004D;
  margin-bottom: 16px;
  margin-top: 0;
}
.form-group {
  margin-bottom: 16px;
}
label {
  font-weight: 500;
  color: #3A004D;
  display: block;
  margin-bottom: 4px;
}
input, textarea, select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}
.button-group {
  display: flex;
  gap: 12px;
  margin-top: 8px;
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
.cancel-btn {
  background: #6c757d;
  color: #fff;
  border: none;
  padding: 10px 24px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}
.cancel-btn:hover {
  background: #5a6268;
}
.success {
  color: #42b883;
  margin-top: 12px;
}
.error {
  color: #ff4d4f;
  margin-top: 12px;
}
.table-container {
  margin-top: 40px;
}
.table-container h3 {
  margin-bottom: 16px;
}
.alert {
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
}
.alert-info {
  background: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}
.dashboard-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.dashboard-table thead {
  background: #3A004D;
  color: #fff;
}
.dashboard-table th, .dashboard-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}
.dashboard-table tbody tr:hover {
  background: #f8f9fa;
}
.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  margin-right: 6px;
}
.edit-btn {
  background: #ffc107;
  color: #000;
}
.edit-btn:hover {
  background: #e0a800;
}
.delete-btn {
  background: #dc3545;
  color: #fff;
}
.delete-btn:hover {
  background: #c82333;
}
</style>

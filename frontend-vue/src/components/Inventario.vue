<template>
  <div>
    <h2 style="color:#fff;">Gestão de Inventário</h2>
    
    <div class="form-container">
      <h3>{{ isEditing ? 'Modificar Item' : 'Criar Novo Item' }}</h3>
      <form @submit.prevent="saveItem" class="inventory-form">
        <div class="form-group">
          <label for="nome">Nome:</label>
          <input type="text" id="nome" v-model="form.nome" required />
        </div>
        <div class="form-group">
          <label for="categoria">Categoria:</label>
          <input type="text" id="categoria" v-model="form.categoria" required />
        </div>
        <div class="form-group">
          <label for="quantidade">Quantidade:</label>
          <input type="number" id="quantidade" v-model.number="form.quantidade" min="0" required />
        </div>
        <div class="form-group">
          <label for="unidadeMedida">Unidade de Medida:</label>
          <input type="text" id="unidadeMedida" v-model="form.unidadeMedida" placeholder="Ex: unidade, kg, litro" required />
        </div>
        <div class="form-group">
          <label for="localizacao">Localização:</label>
          <input type="text" id="localizacao" v-model="form.localizacao" required />
        </div>
        <div class="form-group">
          <label for="status">Status:</label>
          <select id="status" v-model="form.status" required>
            <option value="DISPONIVEL">Disponível</option>
            <option value="RESERVADO">Reservado</option>
            <option value="EM_USO">Em Uso</option>
            <option value="MANUTENCAO">Manutenção</option>
          </select>
        </div>
        <div class="form-group">
          <label for="descricao">Descrição:</label>
          <textarea id="descricao" v-model="form.descricao" rows="2"></textarea>
        </div>
        <div class="button-group">
          <button type="submit" class="submit-btn">{{ isEditing ? 'Guardar' : 'Criar Item' }}</button>
          <button type="button" v-if="isEditing" @click="cancelEdit" class="cancel-btn">Cancelar</button>
        </div>
        <p v-if="message" :class="messageType">{{ message }}</p>
      </form>
    </div>

    <div class="table-container">
      <h3>Itens em Stock</h3>
      <div v-if="inventario.length === 0" class="alert alert-info">
        Nenhum item em inventário. Use o formulário acima para adicionar itens.
      </div>
      <table v-else class="dashboard-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Categoria</th>
            <th>Qtd</th>
            <th>Unidade</th>
            <th>Localização</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in inventario" :key="item.id">
            <td>{{ item.nome }}</td>
            <td>{{ item.categoria }}</td>
            <td>{{ item.quantidade }}</td>
            <td>{{ item.unidadeMedida }}</td>
            <td>{{ item.localizacao }}</td>
            <td>{{ item.status }}</td>
            <td>
              <button @click="editItem(item)" class="action-btn edit-btn">Modificar</button>
              <button @click="deleteItem(item.id)" class="action-btn delete-btn">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
const API_URL = 'http://localhost:3001/api/inventory';

export default {
    data() {
        return {
            inventario: [],
            form: { 
                id: null, 
                nome: '', 
                descricao: '', 
                categoria: '', 
                quantidade: 0, 
                unidadeMedida: 'unidade', 
                localizacao: '', 
                status: 'DISPONIVEL' 
            },
            isEditing: false,
            message: '',
            messageType: '',
        };
    },
    created() { this.fetchInventario(); },
    methods: {
        async fetchInventario() {
            const token = localStorage.getItem('userToken');
            try {
                const response = await axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } });
                this.inventario = response.data;
            } catch (error) { 
                console.error('Erro ao carregar inventário:', error); 
            }
        },
        async saveItem() {
            const token = localStorage.getItem('userToken');
            this.message = '';
            try {
                if (this.isEditing) {
                    await axios.put(`${API_URL}/${this.form.id}`, this.form, { headers: { Authorization: `Bearer ${token}` } });
                    this.message = 'Item atualizado com sucesso!';
                } else {
                    await axios.post(API_URL, this.form, { headers: { Authorization: `Bearer ${token}` } });
                    this.message = 'Item criado com sucesso!';
                }
                this.messageType = 'success';
                this.resetForm();
                this.fetchInventario();
            } catch (error) { 
                this.message = error.response?.data?.message || 'Erro ao guardar item.';
                this.messageType = 'error';
            }
        },
        async deleteItem(id) {
            if (confirm('Tem certeza que deseja eliminar este item?')) {
                const token = localStorage.getItem('userToken');
                try {
                    await axios.delete(`${API_URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
                    this.message = 'Item eliminado com sucesso!';
                    this.messageType = 'success';
                    this.fetchInventario();
                } catch (error) { 
                    this.message = 'Erro ao eliminar item.';
                    this.messageType = 'error';
                }
            }
        },
        editItem(item) { this.form = { ...item }; this.isEditing = true; },
        cancelEdit() { this.resetForm(); },
        resetForm() { 
            this.form = { 
                id: null, 
                nome: '', 
                descricao: '', 
                categoria: '', 
                quantidade: 0, 
                unidadeMedida: 'unidade', 
                localizacao: '', 
                status: 'DISPONIVEL' 
            }; 
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

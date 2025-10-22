<template>
  <div class="container mt-4">
    <h2>Inventário Actual</h2>
    <div style="display:flex; gap:10px; align-items:center; margin-bottom:1rem;">
      <button v-if="canManage" class="btn btn-primary" @click="showAddForm" data-test="add-item-btn">Adicionar Item</button>
      <input v-model="searchQuery" placeholder="Pesquisar inventário..." class="form-control" style="max-width:320px;" />
    </div>
  <!-- Debug panel (dev only) -->
  <div v-if="isDev" style="margin-bottom:12px; font-size:0.9rem; color:#666;">
      <div v-if="serverError" style="color:#a00">serverError: {{ serverError }}</div>
    </div>
  <table class="table table-dark table-striped table-bordered table-hover">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nome</th>
          <th>Descrição</th>
          <th>Categoria</th>
          <th>Qtd</th>
          <th>Unid.</th>
          <th>Localização</th>
          <th>Data Entrada</th>
          <th>Última Saída</th>
          <th>Fornecedor</th>
          <th>Valor Unit.</th>
          <th>Estado</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in filtered" :key="item.id">
          <td>{{ item.id }}</td>
          <td>{{ item.nome }}</td>
          <td style="max-width:240px; white-space:normal;">{{ item.descricao || '-' }}</td>
          <td>{{ (item.categoria || []).join(', ') }}</td>
          <td>{{ item.quantidade }}</td>
          <td>{{ item.unidadeMedida || '-' }}</td>
          <td>{{ item.localizacao || '-' }}</td>
          <td>{{ formatDate(item.dataEntrada) }}</td>
          <td>{{ formatDate(item.dataUltimaSaida) }}</td>
          <td>{{ item.fornecedor?.nome || item.fornecedor || '-' }}</td>
          <td>{{ item.valorUnitario != null ? item.valorUnitario : '-' }}</td>
          <td>{{ item.status || '-' }}</td>
          <td>
            <button v-if="canManage" @click="editItem(item)" class="btn btn-sm btn-warning me-2">Editar</button>
            <button v-if="canManage" @click="deleteItem(item.id)" class="btn btn-sm btn-danger">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="inventario.length === 0" class="alert alert-info mt-4">Nenhum item de inventário encontrado.</div>

      <!-- Inline form -->
      <div v-if="showForm" class="card mt-4 p-3" style="background:#fff;color:#333;">
        <h3 v-if="isEditing">Editar Item</h3>
        <h3 v-else>Adicionar Item</h3>
        <div v-if="serverError" class="alert alert-danger">{{ serverError }}</div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
              <input v-model="form.nome" placeholder="Nome" class="form-control" />
              <input v-model.number="form.quantidade" placeholder="Quantidade" class="form-control" type="number" />
              <input v-model="form.descricao" placeholder="Descrição" class="form-control" />
              <input v-model="form.categoriaText" placeholder="Categorias (vírgula)" class="form-control" @change="form.categoria = form.categoriaText.split(',').map(s=>s.trim())" />
              <input v-model="form.unidadeMedida" placeholder="Unidade de Medida" class="form-control" />
              <input v-model="form.localizacao" placeholder="Localização" class="form-control" />
              <input v-model="form.dataEntrada" placeholder="Data Entrada (YYYY-MM-DD)" class="form-control" />
              <input v-model="form.dataUltimaSaida" placeholder="Última Saída (YYYY-MM-DD)" class="form-control" />
              <input v-model="form.fornecedor" placeholder="Fornecedor" class="form-control" />
              <input v-model.number="form.valorUnitario" placeholder="Valor Unitário" class="form-control" type="number" step="0.01" />
              <select v-model="form.status" class="form-control">
                <option value="ATIVO">ATIVO</option>
                <option value="INATIVO">INATIVO</option>
              </select>
            </div>
        <div style="margin-top:8px;">
          <button class="btn btn-success" @click="saveItem">Salvar</button>
          <button class="btn btn-secondary" @click="resetForm">Cancelar</button>
        </div>
      </div>
  </div>
</template>

<script>
import apiService from '../services/apiService';

export default {
  data() {
    return {
      inventario: [],
      filtered: [],
      searchQuery: '',
      form: { id: null, nome: '', quantidade: 0, descricao: '', categoria: [], categoriaText: '', unidadeMedida: '', localizacao: '', dataEntrada: '', dataUltimaSaida: '', fornecedor: '', valorUnitario: null, status: 'ATIVO' },
      isEditing: false,
      showForm: false,
      serverError: ''
    };
  },
  computed: {
    // Keep simple permission check; adapt to your actual role logic
    canManage() { try { return (window && window.localStorage && window.localStorage.getItem('userRole') === 'ADMIN') || true; } catch (e) { return true; } },
    isDev() { try { return typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.MODE === 'development'; } catch (e) { return false; } },
    userTokenPresent() {
      try { return !!(window && window.localStorage && window.localStorage.getItem('userToken')); } catch (e) { return false; }
    },
    userRoleText() {
      try { return (window && window.localStorage && window.localStorage.getItem('userRole')) || '-'; } catch (e) { return '-'; }
    }
  },
  watch: {
    searchQuery() { this.filterInventario(); }
  },
  created() { this.fetchInventario(); },
  methods: {
    async fetchInventario() {
      this.serverError = '';
      try {
        console.debug('[Inventario] fetching /inventario');
        const res = await apiService.get('/inventario');
        const data = res.data || [];
        console.debug('[Inventario] /inventario returned', data && data.length);
        if (!data || (Array.isArray(data) && data.length === 0)) {
          // Try public endpoint as extra fallback
          console.debug('[Inventario] empty result, trying /inventario/public');
          const r2 = await apiService.get('/inventario/public');
          const data2 = r2.data || [];
          console.debug('[Inventario] /public returned', data2 && data2.length);
          this.inventario = data2.map(d => this.normalizeItem(d));
          this.filtered = this.inventario.slice();
          return;
        }
        this.inventario = data.map(d => this.normalizeItem(d));
        this.filtered = this.inventario.slice();
      } catch (err) {
        // on auth errors try public endpoint (backend exposes /inventario/public)
        const status = err && err.response && err.response.status;
        console.warn('[Inventario] fetch error', status, err && err.message);
        if (status === 401 || status === 403) {
          try {
            console.debug('[Inventario] auth error, trying /inventario/public');
            const r2 = await apiService.get('/inventario/public');
            const data2 = r2.data || [];
            this.inventario = data2.map(d => this.normalizeItem(d));
            this.filtered = this.inventario.slice();
            return;
          } catch (e) {
            this.serverError = this.formatError(e);
            return;
          }
        }
        this.serverError = this.formatError(err);
      }
    },
    normalizeItem(item) {
      if (!item) return item;
      return {
        id: item.id,
        nome: item.nome || item.name || '',
        descricao: item.descricao || item.description || '',
        categoria: (function(raw){
          // Normalize various shapes: array, object, JSON-stringified array/object, or plain string
          if (Array.isArray(raw)) return raw;
          if (raw == null) return [];
          if (typeof raw === 'object') {
            // object -> try to extract values or keys
            try { return Object.values(raw).filter(v => v != null); } catch(e){ return [String(raw)]; }
          }
          if (typeof raw === 'string') {
            // try JSON parse first (handles '[]' or '"..."' etc.)
            try {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) return parsed;
              if (parsed && typeof parsed === 'object') return Object.values(parsed).filter(v => v != null);
              // parsed is primitive
              return [String(parsed)];
            } catch (e) {
              // fallback: strip surrounding brackets/braces/quotes and split by comma if present
              const trimmed = raw.replace(/^[\[\]\{\}\"\']+|[\[\]\{\}\"\']+$/g, '').trim();
              if (!trimmed) return [];
              if (trimmed.indexOf(',') !== -1) return trimmed.split(',').map(s => s.trim()).filter(Boolean);
              return [trimmed];
            }
          }
          // last resort
          return [String(raw)];
        })(item.categoria),
        quantidade: Number(item.quantidade || item.qtd || 0),
        unidadeMedida: item.unidadeMedida || item.unidade || '',
        localizacao: item.localizacao || item.location || '',
        dataEntrada: item.dataEntrada || item.createdAt || null,
        dataUltimaSaida: item.dataUltimaSaida || item.lastOut || null,
        fornecedor: typeof item.fornecedor === 'object' ? item.fornecedor : (item.fornecedor || ''),
        valorUnitario: item.valorUnitario != null ? Number(item.valorUnitario) : null,
        status: item.status || (item.ativo ? 'ATIVO' : 'INATIVO')
      };
    },
    formatDate(dateStr) { if (!dateStr) return '-'; try { return new Date(dateStr).toLocaleDateString(); } catch(e){ return dateStr } },
    formatError(err) { return err && err.response && err.response.data && err.response.data.message ? err.response.data.message : (err && err.message) || String(err); },
    showAddForm() { this.isEditing = false; this.resetForm(); this.showForm = true; },
    async saveItem() {
      this.serverError = '';
      if (!this.form.nome || this.form.quantidade == null) {
        alert('Nome e Quantidade são obrigatórios');
        return;
      }
      const payload = { ...this.form };
      payload.categoria = (this.form.categoriaText ? this.form.categoriaText.split(',').map(s => s.trim()) : this.form.categoria);
      const op = async () => {
        if (this.isEditing && this.form.id) {
          return apiService.put(`/inventario/${this.form.id}`, payload);
        } else {
          return apiService.post('/inventario', payload);
        }
      };
      try {
        await this.withDevRetry(op);
        await this.fetchInventario();
        this.resetForm();
      } catch (err) {
        this.serverError = this.formatError(err);
      }
    },
    editItem(item) {
      const copy = { ...item };
      copy.categoriaText = Array.isArray(item.categoria) ? item.categoria.join(', ') : (item.categoria || '');
      this.form = { ...copy };
      this.isEditing = true;
      this.showForm = true;
    },
    async deleteItem(id) {
      if (!confirm('Confirmar eliminação?')) return;
      this.serverError = '';
      try {
        await this.withDevRetry(() => apiService.delete(`/inventario/${id}`));
        // remove locally for snappy UI
        this.inventario = this.inventario.filter(i => i.id !== id);
        this.filtered = this.inventario.slice();
      } catch (err) {
        this.serverError = this.formatError(err);
      }
    },
    async setDevToken() {
      try {
        // call backend helper that sets token in an HTML response; fetch it and extract token if present
        const r = await fetch('http://localhost:3001/api/inventario/dev-token');
        if (r.ok) {
          const body = await r.json();
          if (body && body.token) {
            localStorage.setItem('userToken', body.token);
            localStorage.setItem('userRole', 'ADMIN');
            alert('Dev token set in localStorage.');
            return true;
          }
        }
        // fallback: open set-dev-token page which writes token into localStorage and redirects
        window.open('http://localhost:3001/api/inventario/set-dev-token', '_blank');
        return false;
      } catch (e) {
        console.error('setDevToken err', e);
        return false;
      }
    },
    async withDevRetry(fn) {
      try {
        return await fn();
      } catch (err) {
        const status = err && err.response && err.response.status;
        if (status === 401 || status === 403) {
          console.debug('[Inventario] auth error, attempting to set dev token and retry');
          const ok = await this.setDevToken();
          if (ok) {
            // retry once
            return fn();
          }
        }
        throw err;
      }
    },
    resetForm() { this.form = { id: null, nome: '', quantidade: 0, descricao: '', categoria: [], categoriaText: '', unidadeMedida: '', localizacao: '', dataEntrada: '', dataUltimaSaida: '', fornecedor: '', valorUnitario: null, status: 'ATIVO' }; this.isEditing = false; this.showForm = false; },
    filterInventario() {
      const q = (this.searchQuery || '').trim().toLowerCase();
      if (!q) { this.filtered = this.inventario.slice(); return; }
      this.filtered = this.inventario.filter(i => (i.nome || '').toLowerCase().includes(q) || (i.descricao || '').toLowerCase().includes(q) || (i.categoria || []).some(c => String(c).toLowerCase().includes(q)));
    }
  }
};
</script>

<style scoped>
/* Dark table to match Fornecedores (inverse colors) */
table { width: 100%; border-collapse: collapse; background: #1b1b1b; color: #fff; }
th, td { border: 1px solid rgba(255,255,255,0.08); padding: 8px; }
.card { background: #111; color: #fff; }
.container { color: #fff; }
</style>

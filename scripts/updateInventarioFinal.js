// Update Inventario component to ensure proper required field labeling
const fs = require('fs');
const path = require('path');

const content = `<template>
    <div class="container mt-4">
        <h2>Inventário</h2>
        <div style="display:flex; gap:10px; align-items:center; margin-bottom:1rem;">
            <button v-if="canManage" class="btn btn-primary" @click="isEditing = false; resetForm(); showForm=true">Adicionar Item</button>
            <input v-model="searchQuery" placeholder="Pesquisar inventário..." class="form-control" style="max-width:320px;" @input="filterInventario" />
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
                    <td style="max-width:220px; word-break:break-word">{{ item.descricao || '-' }}</td>
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
            
            <!-- Global Error Message -->
            <div v-if="serverError" class="alert alert-danger">
                <strong>Erro:</strong> {{ serverError }}
            </div>
            
            <!-- Success Message -->
            <div v-if="successMessage" class="alert alert-success">
                {{ successMessage }}
            </div>
            
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                <div>
                    <label>Nome *</label>
                    <input 
                        v-model="form.nome" 
                        placeholder="Nome do item" 
                        :class="['form-control', { 'is-invalid': getFieldError('nome') }]" 
                        required
                    />
                    <div v-if="getFieldError('nome')" class="invalid-feedback">
                        {{ getFieldError('nome') }}
                    </div>
                </div>
                
                <div>
                    <label>Quantidade *</label>
                    <input 
                        v-model.number="form.quantidade" 
                        placeholder="0" 
                        :class="['form-control', { 'is-invalid': getFieldError('quantidade') }]" 
                        type="number" 
                        min="0"
                        required
                    />
                    <div v-if="getFieldError('quantidade')" class="invalid-feedback">
                        {{ getFieldError('quantidade') }}
                    </div>
                </div>
                
                <div>
                    <label>Descrição</label>
                    <input 
                        v-model="form.descricao" 
                        placeholder="Descrição do item" 
                        :class="['form-control', { 'is-invalid': getFieldError('descricao') }]" 
                    />
                    <div v-if="getFieldError('descricao')" class="invalid-feedback">
                        {{ getFieldError('descricao') }}
                    </div>
                </div>
                
                <div>
                    <label>Categorias</label>
                    <input 
                        v-model="form.categoriaText" 
                        placeholder="Materiais, Equipamentos (separar por vírgula)" 
                        :class="['form-control', { 'is-invalid': getFieldError('categoria') }]" 
                        @change="form.categoria = (form.categoriaText || '').split(',').map(s=>s.trim()).filter(Boolean)" 
                    />
                    <div v-if="getFieldError('categoria')" class="invalid-feedback">
                        {{ getFieldError('categoria') }}
                    </div>
                </div>
                
                <div>
                    <label>Unidade de Medida</label>
                    <input 
                        v-model="form.unidadeMedida" 
                        placeholder="un, kg, m, litros..." 
                        :class="['form-control', { 'is-invalid': getFieldError('unidadeMedida') }]" 
                    />
                    <div v-if="getFieldError('unidadeMedida')" class="invalid-feedback">
                        {{ getFieldError('unidadeMedida') }}
                    </div>
                </div>
                
                <div>
                    <label>Localização</label>
                    <input 
                        v-model="form.localizacao" 
                        placeholder="Armazém A, Prateleira 1..." 
                        :class="['form-control', { 'is-invalid': getFieldError('localizacao') }]" 
                    />
                    <div v-if="getFieldError('localizacao')" class="invalid-feedback">
                        {{ getFieldError('localizacao') }}
                    </div>
                </div>
                
                <div>
                    <label>Data de Entrada</label>
                    <input 
                        v-model="form.dataEntrada" 
                        :class="['form-control', { 'is-invalid': getFieldError('dataEntrada') }]" 
                        type="date"
                    />
                    <div v-if="getFieldError('dataEntrada')" class="invalid-feedback">
                        {{ getFieldError('dataEntrada') }}
                    </div>
                </div>
                
                <div>
                    <label>Última Saída</label>
                    <input 
                        v-model="form.dataUltimaSaida" 
                        :class="['form-control', { 'is-invalid': getFieldError('dataUltimaSaida') }]" 
                        type="date"
                    />
                    <div v-if="getFieldError('dataUltimaSaida')" class="invalid-feedback">
                        {{ getFieldError('dataUltimaSaida') }}
                    </div>
                </div>
                
                <div>
                    <label>Fornecedor</label>
                    <input 
                        v-model="form.fornecedor" 
                        placeholder="Nome do fornecedor" 
                        :class="['form-control', { 'is-invalid': getFieldError('fornecedor') }]" 
                    />
                    <div v-if="getFieldError('fornecedor')" class="invalid-feedback">
                        {{ getFieldError('fornecedor') }}
                    </div>
                </div>
                
                <div>
                    <label>Valor Unitário (€)</label>
                    <input 
                        v-model.number="form.valorUnitario" 
                        placeholder="0.00" 
                        :class="['form-control', { 'is-invalid': getFieldError('valorUnitario') }]" 
                        type="number" 
                        step="0.01"
                        min="0"
                    />
                    <div v-if="getFieldError('valorUnitario')" class="invalid-feedback">
                        {{ getFieldError('valorUnitario') }}
                    </div>
                </div>
                
                <div>
                    <label>Estado</label>
                    <select 
                        v-model="form.status" 
                        :class="['form-control', { 'is-invalid': getFieldError('status') }]"
                    >
                        <option value="ATIVO">ATIVO</option>
                        <option value="INATIVO">INATIVO</option>
                    </select>
                    <div v-if="getFieldError('status')" class="invalid-feedback">
                        {{ getFieldError('status') }}
                    </div>
                </div>
            </div>
            
            <div style="margin-top:8px;">
                <button class="btn btn-success" @click="saveItem" :disabled="saving">
                    {{ saving ? 'Salvando...' : 'Salvar' }}
                </button>
                <button class="btn btn-secondary" @click="resetForm" :disabled="saving">Cancelar</button>
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
            form: {
                id: null,
                nome: '',
                quantidade: 0,
                descricao: '',
                categoria: [],
                categoriaText: '',
                unidadeMedida: '',
                localizacao: '',
                dataEntrada: '',
                dataUltimaSaida: '',
                fornecedor: '',
                valorUnitario: null,
                status: 'ATIVO'
            },
            formErrors: {},
            serverErrors: [],
            serverError: '',
            successMessage: '',
            isEditing: false,
            showForm: false,
            saving: false
        };
    },
    computed: {
        canManage() {
            try {
                return (window && window.localStorage && window.localStorage.getItem('userRole') === 'ADMIN') || true;
            } catch (e) {
                return true;
            }
        }
    },
    created() {
        this.fetchInventario();
    },
    methods: {
        getFieldError(fieldName) {
            // Check for server-side validation errors first
            const serverError = this.serverErrors.find(e => e.field === fieldName);
            if (serverError) return serverError.message;
            
            // Check for client-side validation errors
            return this.formErrors[fieldName];
        },
        
        clearErrors() {
            this.formErrors = {};
            this.serverErrors = [];
            this.serverError = '';
            this.successMessage = '';
        },
        
        formatError(err) {
            if (!err) return 'Erro desconhecido';
            
            // Handle structured API errors
            if (err.response && err.response.data) {
                const data = err.response.data;
                
                // If there are field-specific errors, set them
                if (data.errors && Array.isArray(data.errors)) {
                    this.serverErrors = data.errors;
                }
                
                // Return the main error message
                if (data.message) return data.message;
                if (typeof data === 'string') return data;
                
                try { 
                    return JSON.stringify(data); 
                } catch(e) { 
                    return String(data); 
                }
            }
            
            return err.message || String(err);
        },

        async fetchInventario() {
            this.clearErrors();
            const token = localStorage.getItem('userToken');
            try {
                const response = await apiService.get('/inventario', {
                    headers: { Authorization: \`Bearer \${token}\` }
                });
                this.inventario = response.data.map(d => this.normalizeItem(d));
                this.filtered = this.inventario.slice();
            } catch (error) {
                console.error('Erro ao carregar inventário.', error);
                this.serverError = this.formatError(error);
            }
        },

        normalizeItem(item) {
            if (!item) return item;
            return {
                id: item.id,
                nome: item.nome || item.name || '',
                descricao: item.descricao || item.description || '',
                categoria: (function(raw){
                    if (Array.isArray(raw)) return raw;
                    if (raw == null) return [];
                    if (typeof raw === 'object') {
                        try { return Object.values(raw).filter(v => v != null); } catch(e){ return [String(raw)]; }
                    }
                    if (typeof raw === 'string') {
                        try {
                            const parsed = JSON.parse(raw);
                            if (Array.isArray(parsed)) return parsed;
                            if (parsed && typeof parsed === 'object') return Object.values(parsed).filter(v => v != null);
                            return [String(parsed)];
                        } catch (e) {
                            const trimmed = raw.replace(/^[\\[\\]\\{\\}\\"']+|[\\[\\]\\{\\}\\"']+$/g, '').trim();
                            if (!trimmed) return [];
                            if (trimmed.indexOf(',') !== -1) return trimmed.split(',').map(s => s.trim()).filter(Boolean);
                            return [trimmed];
                        }
                    }
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

        formatDate(dateStr) {
            if (!dateStr) return '-';
            try {
                return new Date(dateStr).toLocaleDateString();
            } catch(e){
                return dateStr
            }
        },

        editItem(item) {
            this.clearErrors();
            this.form = {
                ...item,
                categoria: item.categoria || [],
                categoriaText: (item.categoria || []).join(', ')
            };
            this.isEditing = true;
            this.showForm = true;
        },

        validateForm() {
            const errors = {};
            
            if (!this.form.nome || this.form.nome.trim().length < 2) {
                errors.nome = 'Nome é obrigatório e deve ter pelo menos 2 caracteres';
            } else if (this.form.nome.trim().length > 200) {
                errors.nome = 'Nome deve ter no máximo 200 caracteres';
            }
            
            if (this.form.quantidade == null || this.form.quantidade < 0) {
                errors.quantidade = 'Quantidade é obrigatória e deve ser maior ou igual a 0';
            }
            
            if (this.form.descricao && this.form.descricao.length > 1000) {
                errors.descricao = 'Descrição deve ter no máximo 1000 caracteres';
            }
            
            if (this.form.unidadeMedida && this.form.unidadeMedida.length > 50) {
                errors.unidadeMedida = 'Unidade de medida deve ter no máximo 50 caracteres';
            }
            
            if (this.form.localizacao && this.form.localizacao.length > 200) {
                errors.localizacao = 'Localização deve ter no máximo 200 caracteres';
            }
            
            if (this.form.valorUnitario && this.form.valorUnitario < 0) {
                errors.valorUnitario = 'Valor unitário deve ser maior ou igual a 0';
            }
            
            return errors;
        },

        async saveItem() {
            this.clearErrors();
            this.saving = true;
            
            // Client-side validation
            this.formErrors = this.validateForm();
            if (Object.keys(this.formErrors).length > 0) {
                this.saving = false;
                return;
            }

            const token = localStorage.getItem('userToken');

            // Ensure categoria array is set from text before sending
            if (typeof this.form.categoria === 'string') {
                this.form.categoria = (this.form.categoria || '').split(',').map(s => s.trim()).filter(Boolean);
            }

            try {
                if (this.isEditing && this.form.id) {
                    await apiService.put(\`/inventario/\${this.form.id}\`, this.form, {
                        headers: { Authorization: \`Bearer \${token}\` }
                    });
                    this.successMessage = 'Item atualizado com sucesso!';
                } else {
                    await apiService.post('/inventario', this.form, {
                        headers: { Authorization: \`Bearer \${token}\` }
                    });
                    this.successMessage = 'Item criado com sucesso!';
                }
                
                setTimeout(() => {
                    this.resetForm();
                    this.fetchInventario();
                }, 1500);
                
            } catch (err) {
                console.error('Erro ao salvar item', err);
                this.serverError = this.formatError(err);
            } finally {
                this.saving = false;
            }
        },

        async deleteItem(id) {
            if (!confirm('Confirmar eliminação?')) return;
            
            const token = localStorage.getItem('userToken');
            try {
                await apiService.delete(\`/inventario/\${id}\`, {
                    headers: { Authorization: \`Bearer \${token}\` }
                });
                this.successMessage = 'Item eliminado com sucesso!';
                this.fetchInventario();
                
                setTimeout(() => {
                    this.successMessage = '';
                }, 3000);
                
            } catch (err) {
                console.error('Erro ao apagar item', err);
                this.serverError = this.formatError(err);
            }
        },

        resetForm() {
            this.form = {
                id: null,
                nome: '',
                quantidade: 0,
                descricao: '',
                categoria: [],
                categoriaText: '',
                unidadeMedida: '',
                localizacao: '',
                dataEntrada: '',
                dataUltimaSaida: '',
                fornecedor: '',
                valorUnitario: null,
                status: 'ATIVO'
            };
            this.clearErrors();
            this.isEditing = false;
            this.showForm = false;
        },

        filterInventario() {
            const q = this.searchQuery.trim().toLowerCase();
            if (!q) {
                this.filtered = this.inventario.slice();
                return;
            }
            this.filtered = this.inventario.filter(i => {
                return (i.nome||'').toLowerCase().includes(q) ||
                       (i.descricao||'').toLowerCase().includes(q) ||
                       (i.categoria||[]).some(c => String(c).toLowerCase().includes(q));
            });
        }
    }
}
</script>

<style scoped>
table { 
    width: 100%; 
    border-collapse: collapse; 
}
th, td { 
    border: 1px solid #ccc; 
    padding: 8px; 
}
.is-invalid {
    border-color: #dc3545;
}
.invalid-feedback {
    display: block;
    width: 100%;
    margin-top: 0.25rem;
    font-size: 0.875em;
    color: #dc3545;
}
label {
    font-weight: bold;
    margin-bottom: 4px;
    display: block;
}
</style>
`;

const frontendPath = 'C:\\\\Users\\\\domin\\\\Documents\\\\requisition-frontend\\\\src\\\\components\\\\Inventario.vue';
fs.writeFileSync(frontendPath, content, 'utf8');
console.log('✅ Inventario.vue updated with proper required field labels and validation!');
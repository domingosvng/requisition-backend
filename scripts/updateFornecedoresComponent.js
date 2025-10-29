// Script to create improved Fornecedores.vue with better error handling
const fs = require('fs');
const path = require('path');

const content = `<template>
    <div class="container mt-4">
        <h2>Lista de Fornecedores</h2>
        <div style="display:flex; gap:10px; align-items:center; margin-bottom:1rem;">
            <button class="btn btn-primary" @click="isEditing = false; resetForm(); showForm=true">Adicionar Fornecedor</button>
            <input v-model="searchQuery" placeholder="Pesquisar por nome, categoria..." class="form-control" style="max-width:320px;" @input="filterFornecedores" />
        </div>
        <table class="table table-dark table-striped table-bordered table-hover">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>NIF</th>
                    <th>Contacto</th>
                    <th>Email</th>
                    <th>Telefone</th>
                    <th>Endereço</th>
                    <th>Serviços/Produtos</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="forn in filtered" :key="forn.id">
                    <td>{{ forn.id }}</td>
                    <td>{{ forn.nome }}</td>
                    <td>{{ forn.nif }}</td>
                    <td>{{ forn.contactoPrincipal || '-' }}</td>
                    <td>{{ forn.email || '-' }}</td>
                    <td>{{ forn.telefone || '-' }}</td>
                    <td style="max-width:220px; word-break:break-word">{{ forn.endereco || '-' }}</td>
                    <td>{{ (forn.servicosFornecidos || []).join(', ') }}</td>
                    <td>
                        <button @click="editFornecedor(forn)" class="btn btn-sm btn-warning me-2">Editar</button>
                        <button @click="deleteFornecedor(forn.id)" class="btn btn-sm btn-danger">Eliminar</button>
                    </td>
                </tr>
            </tbody>
        </table>
        <div v-if="fornecedores.length === 0" class="alert alert-info mt-4">Nenhum fornecedor encontrado.</div>
        
        <!-- Inline form -->
        <div v-if="showForm" class="card mt-4 p-3" style="background:#fff;color:#333;">
            <h3 v-if="isEditing">Editar Fornecedor</h3>
            <h3 v-else>Adicionar Fornecedor</h3>
            
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
                    <input 
                        v-model="form.nome" 
                        placeholder="Nome *" 
                        :class="['form-control', { 'is-invalid': getFieldError('nome') }]" 
                    />
                    <div v-if="getFieldError('nome')" class="invalid-feedback">
                        {{ getFieldError('nome') }}
                    </div>
                </div>
                
                <div>
                    <input 
                        v-model="form.nif" 
                        placeholder="NIF" 
                        :class="['form-control', { 'is-invalid': getFieldError('nif') }]" 
                    />
                    <div v-if="getFieldError('nif')" class="invalid-feedback">
                        {{ getFieldError('nif') }}
                    </div>
                </div>
                
                <div>
                    <input 
                        v-model="form.contactoPrincipal" 
                        placeholder="Contacto" 
                        :class="['form-control', { 'is-invalid': getFieldError('contactoPrincipal') }]" 
                    />
                    <div v-if="getFieldError('contactoPrincipal')" class="invalid-feedback">
                        {{ getFieldError('contactoPrincipal') }}
                    </div>
                </div>
                
                <div>
                    <input 
                        v-model="form.email" 
                        placeholder="Email" 
                        type="email"
                        :class="['form-control', { 'is-invalid': getFieldError('email') }]" 
                    />
                    <div v-if="getFieldError('email')" class="invalid-feedback">
                        {{ getFieldError('email') }}
                    </div>
                </div>
                
                <div>
                    <input 
                        v-model="form.telefone" 
                        placeholder="Telefone" 
                        :class="['form-control', { 'is-invalid': getFieldError('telefone') }]" 
                    />
                    <div v-if="getFieldError('telefone')" class="invalid-feedback">
                        {{ getFieldError('telefone') }}
                    </div>
                </div>
                
                <div>
                    <input 
                        v-model="form.endereco" 
                        placeholder="Endereço" 
                        :class="['form-control', { 'is-invalid': getFieldError('endereco') }]" 
                    />
                    <div v-if="getFieldError('endereco')" class="invalid-feedback">
                        {{ getFieldError('endereco') }}
                    </div>
                </div>
                
                <div style="grid-column:1 / -1;">
                    <label>Serviços/Produtos (separe com vírgula)</label>
                    <input 
                        v-model="form.servicosText" 
                        @change="form.servicosFornecidos = (form.servicosText || '').split(',').map(s=>s.trim()).filter(Boolean)" 
                        placeholder="Materiais, Serviços" 
                        :class="['form-control', { 'is-invalid': getFieldError('servicosFornecidos') }]" 
                    />
                    <div v-if="getFieldError('servicosFornecidos')" class="invalid-feedback">
                        {{ getFieldError('servicosFornecidos') }}
                    </div>
                </div>
            </div>
            
            <div style="margin-top:8px;">
                <button class="btn btn-success" @click="saveFornecedor" :disabled="saving">
                    {{ saving ? 'Salvando...' : 'Salvar' }}
                </button>
                <button class="btn btn-secondary" @click="resetForm" :disabled="saving">Cancelar</button>
            </div>
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
            filtered: [],
            searchQuery: '',
            form: { 
                id: null, 
                nome: '', 
                nif: '', 
                contactoPrincipal: '', 
                email: '', 
                telefone: '', 
                endereco: '', 
                servicosFornecidos: [], 
                servicosText: '' 
            },
            formErrors: {},
            serverErrors: [],
            serverError: '',
            successMessage: '',
            isEditing: false,
            showForm: false,
            saving: false,
            serviceOptions: ['Materiais', 'Serviços', 'Transporte', 'Manutenção']
        };
    },
    created() { 
        this.fetchFornecedores(); 
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
        
        async fetchFornecedores() {
            const token = localStorage.getItem('userToken');
            try {
                const response = await axios.get(API_URL, { 
                    headers: { Authorization: \`Bearer \${token}\` } 
                });
                this.fornecedores = response.data;
                this.filtered = this.fornecedores.slice();
            } catch (error) { 
                console.error('Erro ao carregar fornecedores.', error); 
                this.serverError = this.formatError(error);
            }
        },
        
        editFornecedor(fornecedor) { 
            this.clearErrors();
            this.form = { 
                ...fornecedor, 
                servicosFornecidos: fornecedor.servicosFornecidos || [], 
                servicosText: (fornecedor.servicosFornecidos||[]).join(', ') 
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
            
            if (this.form.nif && !/^\\d{5,20}$/.test(this.form.nif)) {
                errors.nif = 'NIF deve conter apenas dígitos (5-20 caracteres)';
            }
            
            if (this.form.email && !/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(this.form.email)) {
                errors.email = 'Email inválido';
            }
            
            if (this.form.telefone && (this.form.telefone.length < 6 || this.form.telefone.length > 30)) {
                errors.telefone = 'Telefone deve ter entre 6 e 30 caracteres';
            }
            
            if (this.form.contactoPrincipal && this.form.contactoPrincipal.length > 100) {
                errors.contactoPrincipal = 'Contacto deve ter no máximo 100 caracteres';
            }
            
            if (this.form.endereco && this.form.endereco.length > 500) {
                errors.endereco = 'Endereço deve ter no máximo 500 caracteres';
            }
            
            return errors;
        },

        async saveFornecedor() {
            this.clearErrors();
            this.saving = true;
            
            // Client-side validation
            this.formErrors = this.validateForm();
            if (Object.keys(this.formErrors).length > 0) {
                this.saving = false;
                return;
            }
            
            const token = localStorage.getItem('userToken');
            
            // Ensure services array is set from text before sending
            if (typeof this.form.servicosFornecidos === 'string') {
                this.form.servicosFornecidos = (this.form.servicosFornecidos || '').split(',').map(s => s.trim()).filter(Boolean);
            }
            
            try {
                if (this.isEditing && this.form.id) {
                    await axios.put(\`\${API_URL}/\${this.form.id}\`, this.form, { 
                        headers: { Authorization: \`Bearer \${token}\` } 
                    });
                    this.successMessage = 'Fornecedor atualizado com sucesso!';
                } else {
                    await axios.post(API_URL, this.form, { 
                        headers: { Authorization: \`Bearer \${token}\` } 
                    });
                    this.successMessage = 'Fornecedor criado com sucesso!';
                }
                
                setTimeout(() => {
                    this.resetForm();
                    this.fetchFornecedores();
                }, 1500);
                
            } catch (err) {
                console.error('Erro ao salvar fornecedor', err);
                this.serverError = this.formatError(err);
            } finally {
                this.saving = false;
            }
        },
        
        async deleteFornecedor(id) {
            if (!confirm('Confirmar eliminação?')) return;
            
            const token = localStorage.getItem('userToken');
            try {
                await axios.delete(\`\${API_URL}/\${id}\`, { 
                    headers: { Authorization: \`Bearer \${token}\` } 
                });
                this.successMessage = 'Fornecedor eliminado com sucesso!';
                this.fetchFornecedores();
                
                setTimeout(() => {
                    this.successMessage = '';
                }, 3000);
                
            } catch (err) {
                console.error('Erro ao apagar fornecedor', err);
                this.serverError = this.formatError(err);
            }
        },
        
        resetForm() { 
            this.form = { 
                id: null, 
                nome: '', 
                nif: '', 
                contactoPrincipal: '', 
                email: '', 
                telefone: '', 
                endereco: '', 
                servicosFornecidos: [], 
                servicosText: '' 
            }; 
            this.clearErrors();
            this.isEditing = false; 
            this.showForm = false; 
        },
        
        filterFornecedores() {
            const q = this.searchQuery.trim().toLowerCase();
            if (!q) { 
                this.filtered = this.fornecedores.slice(); 
                return; 
            }
            this.filtered = this.fornecedores.filter(f => {
                return (f.nome||'').toLowerCase().includes(q) || 
                       (f.servicosFornecidos||[]).some(s => s.toLowerCase().includes(q));
            });
        }
    }
}
</script>

<style scoped>
table { width: 100%; border-collapse: collapse; }
th, td { border: 1px solid #ccc; padding: 8px; }
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
</style>
`;

const frontendPath = 'C:\\\\Users\\\\domin\\\\Documents\\\\requisition-frontend\\\\src\\\\components\\\\Fornecedores.vue';
fs.writeFileSync(frontendPath, content, 'utf8');
console.log('✅ Fornecedores.vue updated with improved error handling!');
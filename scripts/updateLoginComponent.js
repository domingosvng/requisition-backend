// Script to create improved LoginPage.vue with better error handling
const fs = require('fs');
const path = require('path');

const content = `<script setup>
import { ref, defineEmits } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const emit = defineEmits(['login-success']);
const router = useRouter();
const API_BASE_URL = 'http://localhost:3001/api/auth';

const username = ref('');
const password = ref('');
const error = ref('');
const fieldErrors = ref({});
const loading = ref(false);
const isRegister = ref(false);
const success = ref('');

const clearErrors = () => {
  error.value = '';
  fieldErrors.value = {};
};

const getFieldError = (fieldName) => {
  return fieldErrors.value[fieldName];
};

const formatError = (err) => {
  if (!err) return 'Erro desconhecido';
  
  // Handle structured API errors
  if (err.response && err.response.data) {
    const data = err.response.data;
    
    // If there are field-specific errors, set them
    if (data.errors && Array.isArray(data.errors)) {
      const errors = {};
      data.errors.forEach(e => {
        errors[e.field] = e.message;
      });
      fieldErrors.value = errors;
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
};

const validateForm = () => {
  const errors = {};
  
  if (!username.value || username.value.trim().length < 2) {
    errors.username = 'Usuário é obrigatório e deve ter pelo menos 2 caracteres';
  } else if (username.value.trim().length > 50) {
    errors.username = 'Usuário deve ter no máximo 50 caracteres';
  }
  
  if (!password.value || password.value.length < 3) {
    errors.password = 'Senha é obrigatória e deve ter pelo menos 3 caracteres';
  } else if (password.value.length > 100) {
    errors.password = 'Senha deve ter no máximo 100 caracteres';
  }
  
  return errors;
};

const handleSubmit = async () => {
  loading.value = true;
  clearErrors();
  success.value = '';

  // Client-side validation
  const validationErrors = validateForm();
  if (Object.keys(validationErrors).length > 0) {
    fieldErrors.value = validationErrors;
    loading.value = false;
    return;
  }

  if (isRegister.value) {
    // Registration logic
    try {
      await axios.post(\`\${API_BASE_URL}/register\`, {
        username: username.value,
        password: password.value,
      });
      success.value = 'Usuário registrado com sucesso! Agora faça login.';
      isRegister.value = false;
      username.value = '';
      password.value = '';
    } catch (err) {
      const message = formatError(err);
      error.value = message;
    } finally {
      loading.value = false;
    }
    return;
  }

  // Login logic
  try {
    const response = await axios.post(\`\${API_BASE_URL}/login\`, {
      username: username.value,
      password: password.value,
    });
    
    const { token, user } = response.data;
    localStorage.setItem('userToken', token);
    localStorage.setItem('userRole', user.role);
    localStorage.setItem('username', user.username);
    
    // Notify the app in this same tab that auth state changed so NavBar can appear immediately
    try { 
      window.dispatchEvent(new Event('auth-changed')); 
    } catch (e) { 
      /* ignore */ 
    }
    
    router.push('/dashboard');
  } catch (err) {
    const message = formatError(err);
    error.value = message;
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="login-container">
    <h2>Sistema de Gestão de Requisições (VUE)</h2>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="username">Usuário</label>
        <input 
          type="text" 
          id="username" 
          v-model="username" 
          required 
          :disabled="loading"
          :class="['form-input', { 'is-invalid': getFieldError('username') }]"
        />
        <div v-if="getFieldError('username')" class="invalid-feedback">
          {{ getFieldError('username') }}
        </div>
      </div>
      
      <div class="form-group">
        <label for="password">Senha</label>
        <input 
          type="password" 
          id="password" 
          v-model="password" 
          required 
          :disabled="loading"
          :class="['form-input', { 'is-invalid': getFieldError('password') }]"
        />
        <div v-if="getFieldError('password')" class="invalid-feedback">
          {{ getFieldError('password') }}
        </div>
      </div>
      
      <p v-if="error" class="error-message">
        <strong>Erro:</strong> {{ error }}
      </p>
      <p v-if="success" class="success-message">{{ success }}</p>
      
      <button type="submit" :disabled="loading" class="submit-button">
        {{ loading ? (isRegister ? 'Registrando...' : 'Acessando...') : (isRegister ? 'Registrar' : 'Entrar') }}
      </button>
    </form>
    
    <div style="margin-top: 16px; text-align: center;">
      <button 
        type="button" 
        @click="isRegister = !isRegister; clearErrors();" 
        :disabled="loading" 
        class="toggle-button"
      >
        {{ isRegister ? 'Já tem uma conta? Faça login' : 'Não tem uma conta? Registre-se' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 100px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 4px;
  font-weight: bold;
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}

.form-input:focus {
  outline: none;
  border-color: #42b883;
  box-shadow: 0 0 0 2px rgba(66, 184, 131, 0.2);
}

.form-input.is-invalid {
  border-color: #dc3545;
}

.form-input.is-invalid:focus {
  border-color: #dc3545;
  box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.2);
}

.invalid-feedback {
  display: block;
  width: 100%;
  margin-top: 4px;
  font-size: 12px;
  color: #dc3545;
}

.submit-button {
  width: 100%;
  padding: 10px;
  background-color: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-button:hover:not(:disabled) {
  background-color: #369870;
}

.submit-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.toggle-button {
  background: none;
  border: none;
  color: #42b883;
  cursor: pointer;
  font-size: 14px;
  text-decoration: underline;
}

.toggle-button:hover:not(:disabled) {
  color: #369870;
}

.toggle-button:disabled {
  color: #ccc;
  cursor: not-allowed;
}

.error-message {
  color: #dc3545;
  margin: 8px 0;
  padding: 8px;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  font-size: 14px;
}

.success-message {
  color: #155724;
  margin: 8px 0;
  padding: 8px;
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 4px;
  font-size: 14px;
}
</style>
`;

const frontendPath = 'C:\\\\Users\\\\domin\\\\Documents\\\\requisition-frontend\\\\src\\\\components\\\\LoginPage.vue';
fs.writeFileSync(frontendPath, content, 'utf8');
console.log('✅ LoginPage.vue updated with improved error handling!');
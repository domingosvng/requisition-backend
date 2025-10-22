<script setup>
import { ref, defineEmits } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const emit = defineEmits(['login-success']);
const router = useRouter();
const API_BASE_URL = 'http://localhost:3001/api/auth';

const username = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);
const isRegister = ref(false);
const success = ref('');

const handleSubmit = async () => {
  loading.value = true;
  error.value = '';
  success.value = '';

  if (isRegister.value) {
    // Registration logic
    try {
      await axios.post(`${API_BASE_URL}/register`, {
        username: username.value,
        password: password.value,
      });
      success.value = 'Usuário registrado com sucesso! Agora faça login.';
      isRegister.value = false;
      username.value = '';
      password.value = '';
    } catch (err) {
      const message = err.response?.data?.message || 'Falha ao registrar usuário.';
      error.value = message;
    } finally {
      loading.value = false;
    }
    return;
  }

  // Login logic
  try {
    const response = await axios.post(`${API_BASE_URL}/login`, {
      username: username.value,
      password: password.value,
    });
  const { token, user } = response.data;
  localStorage.setItem('userToken', token);
  localStorage.setItem('userRole', user.role);
  localStorage.setItem('username', user.username);
  // Notify the app in this same tab that auth state changed so NavBar can appear immediately
  try { window.dispatchEvent(new Event('auth-changed')); } catch (e) { /* ignore */ }
  router.push('/dashboard');
  } catch (err) {
    const message = err.response?.data?.message || 'Login falhou. Verifique as credenciais.';
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
        <input type="text" id="username" v-model="username" required :disabled="loading" />
      </div>
      <div class="form-group">
        <label for="password">Senha</label>
        <input type="password" id="password" v-model="password" required :disabled="loading" />
      </div>
      <p v-if="error" class="error-message">{{ error }}</p>
      <p v-if="success" class="success-message">{{ success }}</p>
      <button type="submit" :disabled="loading">
        {{ loading ? (isRegister ? 'Registrando...' : 'Acessando...') : (isRegister ? 'Registrar' : 'Entrar') }}
      </button>
    </form>
    <div style="margin-top: 16px; text-align: center;">
      <button type="button" @click="isRegister = !isRegister" :disabled="loading" style="background: none; border: none; color: #42b883; cursor: pointer;">
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
.error-message {
  color: #ff4d4f;
  margin-top: 8px;
}
.success-message {
  color: #42b883;
  margin-top: 8px;
}
</style>